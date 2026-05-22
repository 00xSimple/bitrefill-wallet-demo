"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Badge,
  Skeleton,
  SectionPanel,
  useToast,
} from "@repo/ui";
import {
  ShoppingCart,
  Gift,
  Phone,
  Wifi,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import {
  getBitrefillClient,
  formatCurrency,
  type BitrefillProduct,
} from "@/lib/bitrefill";
import { useCartStore } from "@/lib/store";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<BitrefillProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDenom, setSelectedDenom] = useState(0);
  const [showTerms, setShowTerms] = useState(false);

  const client = getBitrefillClient();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client
      .getProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          toast({ title: "加载商品详情失败", variant: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ product, denominationIndex: selectedDenom, quantity: 1 });
    toast({
      title: "已添加到购物车",
      description: `${product.name} — ${formatCurrency(
        product.denominations[selectedDenom]?.amount ?? 0,
        "CNY"
      )}`,
      variant: "success",
    });
  };

  const typeIcon =
    product?.type === "mobile_topup" ? (
      <Phone className="size-4" />
    ) : product?.type === "esim" ? (
      <Wifi className="size-4" />
    ) : (
      <Gift className="size-4" />
    );

  const typeLabel =
    product?.type === "mobile_topup"
      ? "手机充值"
      : product?.type === "esim"
        ? "eSIM"
        : "礼品卡";

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <Skeleton variant="rectangular" height={40} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" height={320} />
          <div className="space-y-4">
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="rectangular" height={120} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-enter text-center py-20">
        <Gift className="size-12 text-[var(--muted-foreground)] mx-auto mb-4" />
        <p className="text-body-lg font-semibold text-[var(--foreground)]">
          商品未找到
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/products")}
        >
          <ArrowLeft className="size-4" />
          返回商品列表
        </Button>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="size-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Image */}
        <div className="bg-[var(--surface-blue)] rounded-2xl h-56 sm:h-72 lg:h-96 flex items-center justify-center relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Gift className="size-16 text-[var(--muted-foreground)] mx-auto" />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                {product.brand ?? product.name}
              </p>
            </div>
          )}
          <Badge variant="neutral" size="sm" className="absolute top-3 right-3">
            {typeIcon}
            <span className="ml-1.5">{typeLabel}</span>
          </Badge>
          {!product.inStock && (
            <Badge variant="destructive" size="sm" className="absolute top-3 left-3">
              缺货
            </Badge>
          )}
        </div>

        {/* Right — Info & Purchase */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-title-lg text-[var(--foreground)]">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-[var(--muted-foreground)]">
              <Globe className="size-3.5" />
              <span>
                {product.countryName || product.countryCode}
              </span>
              {product.brand && product.brand !== product.countryName && (
                <>
                  <span>·</span>
                  <span>{product.brand}</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <SectionPanel padding="md">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                商品说明
              </h3>
              <p className="text-body-sm text-[var(--muted-foreground)] whitespace-pre-line leading-relaxed">
                {product.description.replace(/<br\s*\/?>/gi, "\n")}
              </p>
            </SectionPanel>
          )}

          {/* Denomination selector */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              选择面额
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.denominations.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDenom(i)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    i === selectedDenom
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {formatCurrency(d.amount, "CNY")}
                  </p>
                  {d.value !== d.amount && (
                    <p className="text-2xs text-[var(--muted-foreground)]">
                      面值 {formatCurrency(d.value, "CNY")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <Button
            size="lg"
            className="w-full"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="size-5" />
            加入购物车 —{" "}
            {formatCurrency(
              product.denominations[selectedDenom]?.amount ?? 0,
              "CNY"
            )}
          </Button>

          {/* Terms */}
          {product.termsAndConditions && (
            <div>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showTerms ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                条款与条件
              </button>
              {showTerms && (
                <div className="mt-2 p-3 rounded-lg bg-[var(--secondary)]">
                  <p className="text-xs text-[var(--muted-foreground)] whitespace-pre-line leading-relaxed">
                    {product.termsAndConditions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
