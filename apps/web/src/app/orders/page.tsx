"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  SectionPanel,
  IconBox,
  Skeleton,
  useToast,
} from "@repo/ui";
import {
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  Wallet,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrderStore, useWalletStore } from "@/lib/store";
import {
  getBitrefillClient,
  formatCurrency,
  type BitrefillInvoice,
} from "@/lib/bitrefill";
import { PaymentPanel } from "@/components/PaymentPanel";
import { SendPaymentDialog } from "@/components/SendPaymentDialog";

const statusConfig: Record<
  string,
  { icon: React.FC<{ className?: string }>; label: string; variant: "success" | "primary" | "neutral" | "destructive" }
> = {
  delivered: { icon: CheckCircle, label: "已交付", variant: "success" },
  complete: { icon: CheckCircle, label: "已完成", variant: "success" },
  not_delivered: { icon: Clock, label: "待处理", variant: "primary" },
  all_error: { icon: XCircle, label: "失败", variant: "destructive" },
  expired: { icon: XCircle, label: "已过期", variant: "destructive" },
};

function getDisplayStatus(invoice: BitrefillInvoice): { label: string; icon: React.FC<{ className?: string }>; variant: "success" | "primary" | "neutral" | "destructive" } {
  if (invoice.status === "not_delivered") {
    if (invoice.paymentStatus === "unpaid" && invoice.paymentMethod !== "balance") {
      return { icon: Clock, label: "待支付", variant: "primary" };
    }
    return { icon: Clock, label: "处理中", variant: "primary" };
  }
  return statusConfig[invoice.status] ?? { icon: Clock, label: invoice.status, variant: "neutral" };
}

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { orders, addOrder, updateOrder, setOrders } = useOrderStore();
  const { selectedAccount, keystoreJson } = useWalletStore();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [sendDialogInvoice, setSendDialogInvoice] = useState<BitrefillInvoice | null>(null);

  // Fetch invoices from API on mount, then fetch redemption codes
  const loadFromApi = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const client = getBitrefillClient();
    try {
      const result = await client.listInvoices({ limit: 100 });
      setOrders(result.invoices);

      // Fetch redemption codes for completed invoices that lack them
      for (const inv of result.invoices) {
        if (
          (inv.status === "complete" || inv.status === "delivered") &&
          inv.orderIds?.length &&
          !inv.deliveryDetails?.code
        ) {
          try {
            const order = await client.getOrder(inv.orderIds![0]!);
            if (order.redemptionInfo?.code) {
              updateOrder(inv.id, {
                deliveryDetails: {
                  code: order.redemptionInfo.code,
                  instructions: order.redemptionInfo.instructions,
                  pin: order.redemptionInfo.pin,
                },
              });
            }
          } catch {
            // skip
          }
        }
      }
    } catch (e: any) {
      setLoadError(e.message || "加载订单失败");
    } finally {
      setLoading(false);
    }
  }, [setOrders, updateOrder]);

  useEffect(() => {
    if (!keystoreJson) {
      setOrders([]);
      return;
    }
    loadFromApi();
  }, [keystoreJson]);

  // Refresh single invoice status
  const handleRefreshInvoice = useCallback(
    async (invoiceId: string) => {
      setRefreshingId(invoiceId);
      const client = getBitrefillClient();
      try {
        const updated = await client.getInvoice(invoiceId);
        updateOrder(invoiceId, updated);

        // Fetch redemption if newly completed
        if (
          (updated.status === "complete" || updated.status === "delivered") &&
          updated.orderIds?.length
        ) {
          try {
            const order = await client.getOrder(updated.orderIds![0]!);
            if (order.redemptionInfo?.code) {
              updateOrder(invoiceId, {
                deliveryDetails: {
                  code: order.redemptionInfo.code,
                  instructions: order.redemptionInfo.instructions,
                  pin: order.redemptionInfo.pin,
                },
              });
            }
          } catch {
            // skip
          }
        }
      } catch {
        // Silently fail
      } finally {
        setRefreshingId(null);
      }
    },
    [updateOrder]
  );

  // Poll active invoices
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const activeIds = orders
      .filter((o) => o.status === "not_delivered")
      .map((o) => o.id);

    if (activeIds.length === 0) return;

    pollRef.current = setInterval(async () => {
      const client = getBitrefillClient();
      const store = useOrderStore.getState();
      for (const id of activeIds) {
        try {
          const updated = await client.getInvoice(id);
          updateOrder(id, updated);

          // Fetch redemption if newly completed
          if (
            (updated.status === "complete" || updated.status === "delivered") &&
            updated.orderIds?.length
          ) {
            try {
              const order = await client.getOrder(updated.orderIds![0]!);
              if (order.redemptionInfo?.code) {
                updateOrder(id, {
                  deliveryDetails: {
                    code: order.redemptionInfo.code,
                    instructions: order.redemptionInfo.instructions,
                    pin: order.redemptionInfo.pin,
                  },
                });
              }
            } catch {
              // skip
            }
          }
        } catch {
          // Skip failed polls
        }
      }
    }, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orders.filter((o) => o.status === "not_delivered").join(",")]);

  // Re-create an expired invoice
  const handleRetryOrder = async (invoice: BitrefillInvoice) => {
    const client = getBitrefillClient();
    setCreatingInvoice(true);
    try {
      const newInvoice = await client.createInvoice({
        productId: invoice.productId,
        denomination: invoice.amount,
        paymentMethod: invoice.paymentMethod,
      });
      addOrder(newInvoice);
      toast({ title: "订单已重新创建", variant: "success" });
    } catch (e: any) {
      toast({ title: "重新创建失败", description: e.message, variant: "error" });
    } finally {
      setCreatingInvoice(false);
    }
  };

  const isFinishedStatus = (s: string) =>
    s !== "not_delivered";
  const hasPaymentAddress = (o: BitrefillInvoice) =>
    o.paymentAddress && o.paymentMethod !== "balance" && o.paymentStatus === "unpaid";

  const pendingOrders = orders.filter((o) => o.status === "not_delivered");
  const completedOrders = orders.filter((o) => isFinishedStatus(o.status));

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-title-lg text-[var(--foreground)]">我的订单</h1>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
            查看和管理所有订单
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadFromApi} loading={loading}>
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push("/cart")}>
            <ShoppingBag className="size-4" />
            购物车
          </Button>
          <Button variant="outline" onClick={() => router.push("/products")}>
            <ShoppingBag className="size-4" />
            继续购物
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={120} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <SectionPanel padding="lg" className="border-[var(--warning)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                加载订单失败
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">
                {loadError}
              </p>
              <Button variant="outline" size="sm" onClick={loadFromApi}>
                <RefreshCw className="size-3.5" />
                重试
              </Button>
            </div>
          </div>
        </SectionPanel>
      )}

      {/* Empty state */}
      {!loading && !loadError && orders.length === 0 && (
        <SectionPanel padding="xl" className="text-center">
          <Receipt className="size-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-body-lg font-semibold text-[var(--foreground)]">暂无订单</p>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2 mb-4">
            去商店选购你喜欢的商品
          </p>
          <Button onClick={() => router.push("/products")}>
            <ShoppingBag className="size-4" />
            去选购
          </Button>
        </SectionPanel>
      )}

      {/* Active payment panels */}
      {!loading && pendingOrders.map((order) => {
        const displayStatus = getDisplayStatus(order);
        const StatusIcon = displayStatus.icon;
        return (
        <div key={order.id} className="space-y-4">
          {/* Order summary header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-title-sm text-[var(--foreground)]">{order.productName}</h2>
              <p className="text-2xs text-[var(--muted-foreground)]">
                订单号: {order.id} · 创建于{" "}
                {new Date(order.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <Badge variant={displayStatus.variant} size="md">
              <StatusIcon className="size-3.5" />
              <span className="ml-1">{displayStatus.label}</span>
            </Badge>
          </div>

          {/* Product details from orders */}
          {order.orders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.orders.map((o) => (
                <SectionPanel key={o.id} padding="md" className="border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    {o.product.image && (
                      <img
                        src={`https://cdn.bitrefill.com/primg/w48h32/${o.product.id}.webp`}
                        alt={o.product.name}
                        className="size-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                        {o.product.name}
                      </p>
                      <p className="text-2xs text-[var(--muted-foreground)]">
                        {o.product.value} {o.product.currency}
                      </p>
                    </div>
                  </div>
                </SectionPanel>
              ))}
            </div>
          )}

          {/* Payment panel (only for unpaid crypto invoices) */}
          {hasPaymentAddress(order) && (
            <PaymentPanel
              invoice={order}
              onRefresh={() => handleRefreshInvoice(order.id)}
              loading={refreshingId === order.id}
            />
          )}

          {/* Send from wallet button (only for unpaid crypto invoices) */}
          {hasPaymentAddress(order) && selectedAccount && keystoreJson && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSendDialogInvoice(order)}
            >
              <Wallet className="size-4" />
              从钱包发送支付
            </Button>
          )}

          {/* Delivery code (for completed/delivered) */}
          {(order.status === "delivered" || order.status === "complete") && order.deliveryDetails?.code && (
            <SectionPanel padding="md" className="border-[var(--success-border)]">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="size-4 text-[var(--success)]" />
                <span className="text-sm font-semibold text-[var(--success-text)]">
                  兑换码已生成
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--success-surface)] rounded-lg p-3">
                <code className="text-sm font-bold text-[var(--success-text)] flex-1 tracking-wider">
                  {order.deliveryDetails.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(order.deliveryDetails!.code!);
                    toast({ title: "兑换码已复制", variant: "success" });
                  }}
                >
                  复制
                </Button>
              </div>
              {order.deliveryDetails.instructions && (
                <p className="text-2xs text-[var(--muted-foreground)] mt-2">
                  {order.deliveryDetails.instructions}
                </p>
              )}
            </SectionPanel>
          )}

          {/* Actions for ended orders */}
          {order.status === "expired" && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleRetryOrder(order)}>
              <ArrowRight className="size-3.5" />
              重新创建
            </Button>
          )}
          {order.status === "all_error" && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleRetryOrder(order)}>
              重试
            </Button>
          )}
        </div>
      )})}

      {/* Completed orders list */}
      {!loading && completedOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-title-sm text-[var(--foreground)]">历史订单</h2>
          {completedOrders.map((order) => {
            const displayStatus = getDisplayStatus(order);
            const StatusIcon = displayStatus.icon;
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconBox variant="primary-soft" size="xs">
                        <Receipt className="size-4" />
                      </IconBox>
                      <div>
                        <CardTitle>{order.productName}</CardTitle>
                        <CardDescription>订单号: {order.id}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={displayStatus.variant} size="md">
                      <StatusIcon className="size-3.5" />
                      <span className="ml-1">{displayStatus.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoBlock label="金额" value={formatCurrency(order.amount, order.currency)} />
                    <InfoBlock label="支付方式" value={order.paymentMethod || "—"} />
                    <InfoBlock
                      label="创建时间"
                      value={new Date(order.createdAt).toLocaleDateString("zh-CN")}
                    />
                    <InfoBlock label="状态" value={displayStatus.label} />
                  </div>
                  {/* Order products */}
                  {order.orders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {order.orders.map((o) => (
                        <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-page)] border border-[var(--border)]">
                          {o.product.image && (
                            <img
                              src={`https://cdn.bitrefill.com/primg/w48h32/${o.product.id}.webp`}
                              alt={o.product.name}
                              className="size-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                              {o.product.name}
                            </p>
                            <p className="text-2xs text-[var(--muted-foreground)]">
                              {o.product.value} {o.product.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {(order.status === "delivered" || order.status === "complete") && order.deliveryDetails?.code && (
                  <CardFooter>
                    <div className="w-full">
                      <p className="text-xs font-semibold text-[var(--foreground)] mb-2">
                        兑换信息
                      </p>
                      <div className="flex items-center gap-2 bg-[var(--success-surface)] rounded-lg p-3">
                        <code className="text-sm font-bold text-[var(--success-text)] flex-1 tracking-wider">
                          {order.deliveryDetails.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(order.deliveryDetails!.code!);
                            toast({ title: "兑换码已复制", variant: "success" });
                          }}
                        >
                          复制
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Send Payment Dialog */}
      {sendDialogInvoice && selectedAccount && keystoreJson && (
        <SendPaymentDialog
          invoice={sendDialogInvoice}
          account={selectedAccount}
          keystoreJson={keystoreJson}
          open
          onClose={() => setSendDialogInvoice(null)}
          onSuccess={() => {
            handleRefreshInvoice(sendDialogInvoice.id);
          }}
        />
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs text-[var(--muted-foreground)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--foreground)] capitalize">
        {value}
      </p>
    </div>
  );
}
