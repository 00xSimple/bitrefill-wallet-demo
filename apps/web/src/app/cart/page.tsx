"use client";

import React, { useState, useCallback } from "react";
import {
  Button,
  Badge,
  Input,
  SectionPanel,
  useToast,
} from "@repo/ui";
import {
  ShoppingBag,
  Wallet,
  Trash2,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore, useOrderStore, useWalletStore } from "@/lib/store";
import {
  getBitrefillClient,
  formatCurrency,
  PAYMENT_METHODS,
} from "@/lib/bitrefill";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { selectedAccount } = useWalletStore();

  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ethereum");

  const chainPaymentMethod =
    selectedAccount && PAYMENT_METHODS[selectedAccount.chain]
      ? PAYMENT_METHODS[selectedAccount.chain]
      : "ethereum";

  const handleCheckout = useCallback(async () => {
    if (items.length === 0) {
      toast({ title: "购物车为空", description: "请先添加商品到购物车", variant: "warning" });
      return;
    }

    setCreatingInvoice(true);
    const client = getBitrefillClient();
    const method = paymentMethod || chainPaymentMethod || "ethereum";
    let createdCount = 0;

    for (const item of items) {
      const denom = item.product.denominations[item.denominationIndex];
      if (!denom) continue;

      try {
        const invoice = await client.createInvoice({
          productId: item.product.id,
          denomination: denom.value || denom.amount,
          paymentMethod: method,
          email: email || undefined,
          phone: phone || undefined,
        });
        addOrder(invoice);
        createdCount++;
      } catch (e: any) {
        toast({
          title: `创建 ${item.product.name} 订单失败`,
          description: e.message || "API 请求失败",
          variant: "error",
        });
      }
    }

    if (createdCount > 0) {
      clearCart();
      toast({
        title: `${createdCount} 个订单已创建`,
        description: "正在跳转到订单页面",
        variant: "success",
      });
      router.push("/orders");
    }

    setCreatingInvoice(false);
  }, [items, paymentMethod, chainPaymentMethod, email, selectedAccount, addOrder, clearCart, toast, router]);

  const totalAmount = items.reduce(
    (sum, it) =>
      sum +
      (it.product.denominations[it.denominationIndex]?.amount ?? 0) *
        it.quantity,
    0
  );
  const currency = items[0]?.product.denominations[0]?.currency ?? "CNY";

  if (items.length === 0) {
    return (
      <div className="page-enter">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-title-lg text-[var(--foreground)]">购物车</h1>
            <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
              查看和管理购物车中的商品
            </p>
          </div>
        </div>

        <SectionPanel padding="xl" className="text-center">
          <ShoppingCart className="size-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-body-lg font-semibold text-[var(--foreground)]">购物车为空</p>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2 mb-4">
            去礼品卡商店选购你喜欢的商品
          </p>
          <Button onClick={() => router.push("/products")}>
            <ShoppingBag className="size-4" />
            去选购
          </Button>
        </SectionPanel>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-title-lg text-[var(--foreground)]">购物车</h1>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
            确认商品并完成支付
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/products")}>
          <ShoppingBag className="size-4" />
          继续购物
        </Button>
      </div>

      <SectionPanel padding="lg">
        <h2 className="text-title-sm text-[var(--foreground)] mb-4">
          商品列表 ({items.length})
        </h2>

        {/* Cart items */}
        <div className="space-y-2 mb-4">
          {items.map((item) => {
            const denom = item.product.denominations[item.denominationIndex];
            return (
              <div
                key={item.product.id}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-2xs text-[var(--muted-foreground)]">
                    {item.product.countryCode} · x{item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {denom ? formatCurrency(denom.amount * item.quantity, denom.currency) : "—"}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-4 pt-2 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--foreground)]">总计</span>
          <span className="text-title-sm font-bold text-[var(--foreground)]">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">
              邮箱 (可选)
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">
              手机号 (话费充值必填)
            </label>
            <Input
              type="tel"
              placeholder="+86 13800000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">
              支付方式
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-page)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              {Object.entries(PAYMENT_METHODS).map(([chain, method]) => (
                <option key={chain} value={method}>
                  {chain === selectedAccount?.chain ? "⭐ " : ""}
                  {chain} ({method})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkout button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          loading={creatingInvoice}
          disabled={!selectedAccount}
        >
          {selectedAccount ? (
            <>
              <Wallet className="size-4" />
              创建订单并支付
            </>
          ) : (
            <>
              <Wallet className="size-4" />
              请先在钱包管理页面连接钱包
            </>
          )}
        </Button>
      </SectionPanel>
    </div>
  );
}
