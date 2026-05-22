"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton,
  SectionPanel,
  IconBox,
  useToast,
} from "@repo/ui";
import {
  Wallet,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/store";
import {
  getBitrefillClient,
  formatCurrency,
  type BitrefillProduct,
} from "@/lib/bitrefill";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { accounts, selectedAccount } = useWalletStore();
  const [featured, setFeatured] = useState<BitrefillProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = getBitrefillClient();
    client
      .getFeaturedProducts()
      .then(setFeatured)
      .catch((e) => {
        setError(e.message);
        toast({
          title: "无法加载推荐商品",
          description: "使用模拟数据展示",
          variant: "warning",
        });
        setFeatured(getMockProducts());
      })
      .finally(() => setLoading(false));
  }, []);

  const hasWallet = accounts.length > 0;

  return (
    <div className="page-enter space-y-8">
      {/* Hero */}
      <section>
        <h1 className="text-display-lg text-[var(--foreground)]">
          让你的钱包成为
          <br />
          <span className="identity-gradient">电商助手</span>
        </h1>
        <p className="mt-3 text-body-lg text-[var(--muted-foreground)] max-w-lg">
          使用加密货币安全购买数字商品、手机充值和 eSIM —
          覆盖全球180+国家和地区，1500+品牌。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {!hasWallet ? (
            <Button size="lg" onClick={() => router.push("/wallet")}>
              <Wallet className="size-4" />
              创建或导入钱包
            </Button>
          ) : (
            <Button size="lg" onClick={() => router.push("/products")}>
              <ShoppingBag className="size-4" />
              浏览商店
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/products")}
          >
            查看所有商品
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={<Globe className="size-5" />}
          label="覆盖国家"
          value="180+"
          variant="primary"
        />
        <StatCard
          icon={<Sparkles className="size-5" />}
          label="品牌数量"
          value="1,500+"
          variant="success"
        />
        <StatCard
          icon={<Zap className="size-5" />}
          label="即时交付"
          value="&lt; 1分钟"
          variant="primary"
        />
        <StatCard
          icon={<Shield className="size-5" />}
          label="支付安全"
          value="多链支持"
          variant="success"
        />
      </section>

      {/* Featured Products */}
      <SectionPanel padding="lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-title-sm text-[var(--foreground)]">
              热门商品
            </h2>
            <p className="text-body-sm text-[var(--muted-foreground)] mt-1">
              最受欢迎的数字商品和充值产品
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/products")}
          >
            查看全部
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={200} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => router.push(`/products?id=${p.id}`)}
              />
            ))}
          </div>
        )}
      </SectionPanel>

      {/* Wallet Quick Info */}
      {hasWallet && (
        <SectionPanel padding="lg">
          <h2 className="text-title-sm text-[var(--foreground)] mb-4">
            我的钱包
          </h2>
          <div className="flex items-center gap-4 p-4 rounded-20 bg-[var(--surface-blue)]">
            <IconBox variant="primary-soft" size="sm">
              <Wallet className="size-5" />
            </IconBox>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {selectedAccount?.chain} 账户
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">
                {selectedAccount?.address}
              </p>
            </div>
            <Badge variant="success" size="sm">
              已连接
            </Badge>
          </div>
        </SectionPanel>
      )}
    </div>
  );
}

// ---- Sub-components ----

function StatCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: "primary" | "success";
}) {
  return (
    <Card className="flex-row items-center gap-4">
      <IconBox variant={variant === "primary" ? "primary-soft" : "success"} size="sm">
        {icon}
      </IconBox>
      <div>
        <p className="text-2xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-title-sm text-[var(--foreground)]">{value}</p>
      </div>
    </Card>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: BitrefillProduct;
  onClick: () => void;
}) {
  const price = product.denominations[0];
  return (
    <Card
      className="cursor-pointer hover:shadow-[var(--shadow-card-md)] transition-shadow duration-[var(--duration-fast)] p-0 overflow-hidden"
      onClick={onClick}
    >
      <div className="h-32 bg-[var(--surface-blue)] flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ShoppingBag className="size-10 text-[var(--muted-foreground)]" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
          {product.name}
        </p>
        <p className="text-2xs text-[var(--muted-foreground)] mt-0.5 truncate">
          {product.brand ?? product.category}
        </p>
        {price && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {formatCurrency(price.amount, price.currency)}
            </span>
            <Badge variant="success" size="sm">
              {product.type === "gift_card" ? "礼品卡" : "充值"}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---- Mock data fallback ----

function getMockProducts(): BitrefillProduct[] {
  const brands = [
    "Amazon", "Steam", "Google Play", "Apple", "Netflix",
    "Spotify", "Xbox", "PlayStation", "Uber", "Airbnb",
    "Nintendo", "Roblox",
  ];
  return brands.map((name, i) => ({
    id: `mock-${i}`,
    name: `${name} Gift Card`,
    description: `Digital ${name} gift card, delivered instantly.`,
    category: "Gift Cards",
    countryCode: "US",
    price: { currency: "USD", amount: 25 + i * 5 },
    denominations: [
      { currency: "USD", amount: 25 + i * 5, value: 25 + i * 5 },
    ],
    brand: name,
    type: "gift_card" as const,
    inStock: true,
  }));
}
