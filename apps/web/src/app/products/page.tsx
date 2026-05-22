"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Badge,
  Input,
  Chip,
  Skeleton,
  SectionPanel,
  useToast,
} from "@repo/ui";
import {
  Search,
  Filter,
  Gift,
  Phone,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import {
  getBitrefillClient,
  formatCurrency,
  type BitrefillProduct,
  type BitrefillCategory,
} from "@/lib/bitrefill";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<BitrefillProduct[]>([]);
  const [categories, setCategories] = useState<BitrefillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const client = getBitrefillClient();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let result: { products: BitrefillProduct[]; total: number };
      if (search) {
        const products = await client.searchProducts(search);
        result = { products, total: products.length };
      } else {
        result = await client.getProducts({ country: "CN", limit: 50 });
      }
      let filtered = Array.isArray(result.products) ? result.products : getMockProducts();
      // Client-side category filter — API doesn't support category param directly
      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }
      setProducts(filtered);
    } catch {
      toast({
        title: "无法加载商品列表",
        description: "使用模拟数据展示",
        variant: "warning",
      });
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    // Categories match the actual API category strings for filtering
    setCategories([
      { id: "refill", name: "手机充值", slug: "refill", productCount: 0 },
      { id: "pin", name: "预付卡", slug: "pin", productCount: 0 },
      { id: "bundles", name: "流量套餐", slug: "bundles", productCount: 0 },
      { id: "data", name: "流量充值", slug: "data", productCount: 0 },
      { id: "food", name: "餐饮美食", slug: "food", productCount: 0 },
      { id: "apparel", name: "服饰购物", slug: "apparel", productCount: 0 },
      { id: "electronics", name: "电子产品", slug: "electronics", productCount: 0 },
      { id: "gifts", name: "礼品礼物", slug: "gifts", productCount: 0 },
      { id: "health-beauty", name: "美妆护肤", slug: "health-beauty", productCount: 0 },
      { id: "transportation", name: "交通出行", slug: "transportation", productCount: 0 },
      { id: "voip", name: "网络通讯", slug: "voip", productCount: 0 },
    ]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-title-lg text-[var(--foreground)]">礼品卡商店</h1>
        <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
          浏览 1,500+ 品牌，覆盖 180+ 国家和地区
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜索品牌、分类..."
            leftIcon={<Search className="size-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        <Chip
          selected={selectedCategory === null}
          onClick={() => setSelectedCategory(null)}
        >
          <Filter className="size-3.5" />
          全部
        </Chip>
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="whitespace-nowrap">{cat.name}</span>
          </Chip>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={260} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <SectionPanel padding="xl" className="text-center">
          <Gift className="size-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-body-lg font-semibold text-[var(--foreground)]">
            未找到商品
          </p>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
            尝试其他搜索词或分类
          </p>
        </SectionPanel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductDetailCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Product Card ----

function ProductDetailCard({
  product,
}: {
  product: BitrefillProduct;
}) {
  const typeIcon =
    product.type === "mobile_topup" ? (
      <Phone className="size-3.5" />
    ) : product.type === "esim" ? (
      <Wifi className="size-3.5" />
    ) : (
      <Gift className="size-3.5" />
    );

  const typeLabel =
    product.type === "mobile_topup"
      ? "手机充值"
      : product.type === "esim"
        ? "eSIM"
        : "礼品卡";

  const denomAmounts = product.denominations.map((d) => d.amount);
  const minPrice = denomAmounts.length > 0 ? Math.min(...denomAmounts) : 0;
  const maxPrice = denomAmounts.length > 1 ? Math.max(...denomAmounts) : 0;

  return (
    <Link href={`/products/${product.id}`} className="block">
      <Card className="p-0 overflow-hidden animate-fade-in hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="h-28 sm:h-36 bg-[var(--surface-blue)] flex items-center justify-center relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Gift className="size-10 text-[var(--muted-foreground)] mx-auto" />
              <p className="text-2xs text-[var(--muted-foreground)] mt-1">
                {product.brand ?? product.name}
              </p>
            </div>
          )}
          <Badge variant="neutral" size="sm" className="absolute top-2 right-2">
            {typeIcon}
            <span className="ml-1">{typeLabel}</span>
          </Badge>
          {!product.inStock && (
            <Badge variant="destructive" size="sm" className="absolute top-2 left-2">
              缺货
            </Badge>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)] leading-tight line-clamp-1">
            {product.name}
          </p>
          <p className="text-2xs text-[var(--muted-foreground)]">
            {product.countryCode === "XI" ? "国际" : product.countryCode} · {product.brand ?? product.category}
          </p>
          <p className="text-xs font-semibold text-[var(--primary)]">
            {maxPrice > minPrice
              ? `${formatCurrency(minPrice, "CNY")} — ${formatCurrency(maxPrice, "CNY")}`
              : formatCurrency(minPrice, "CNY")}
          </p>
        </div>
      </Card>
    </Link>
  );
}

// ---- Mock data fallback ----

function getMockProducts(): BitrefillProduct[] {
  const items: BitrefillProduct[] = [
    { id: "m1", name: "Amazon 礼品卡", description: "", category: "购物", countryCode: "US", price: { currency: "CNY", amount: 25 }, denominations: [{ currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }, { currency: "CNY", amount: 100, value: 100 }], brand: "Amazon", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m2", name: "Steam 礼品卡", description: "", category: "游戏", countryCode: "US", price: { currency: "CNY", amount: 20 }, denominations: [{ currency: "CNY", amount: 20, value: 20 }, { currency: "CNY", amount: 50, value: 50 }], brand: "Steam", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m3", name: "Google Play 礼品卡", description: "", category: "应用", countryCode: "US", price: { currency: "CNY", amount: 15 }, denominations: [{ currency: "CNY", amount: 15, value: 15 }, { currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }], brand: "Google Play", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m4", name: "Apple 礼品卡", description: "", category: "数码", countryCode: "US", price: { currency: "CNY", amount: 25 }, denominations: [{ currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }, { currency: "CNY", amount: 100, value: 100 }], brand: "Apple", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m5", name: "Netflix 礼品卡", description: "", category: "娱乐", countryCode: "US", price: { currency: "CNY", amount: 30 }, denominations: [{ currency: "CNY", amount: 30, value: 30 }, { currency: "CNY", amount: 60, value: 60 }], brand: "Netflix", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m6", name: "Spotify 礼品卡", description: "", category: "音乐", countryCode: "US", price: { currency: "CNY", amount: 10 }, denominations: [{ currency: "CNY", amount: 10, value: 10 }, { currency: "CNY", amount: 30, value: 30 }, { currency: "CNY", amount: 60, value: 60 }], brand: "Spotify", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m7", name: "Xbox 礼品卡", description: "", category: "游戏", countryCode: "US", price: { currency: "CNY", amount: 25 }, denominations: [{ currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }, { currency: "CNY", amount: 100, value: 100 }], brand: "Xbox", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m8", name: "PlayStation 礼品卡", description: "", category: "游戏", countryCode: "US", price: { currency: "CNY", amount: 25 }, denominations: [{ currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }, { currency: "CNY", amount: 100, value: 100 }], brand: "PlayStation", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m9", name: "Uber 礼品卡", description: "", category: "出行", countryCode: "US", price: { currency: "CNY", amount: 25 }, denominations: [{ currency: "CNY", amount: 25, value: 25 }, { currency: "CNY", amount: 50, value: 50 }], brand: "Uber", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m10", name: "Airbnb 礼品卡", description: "", category: "旅行", countryCode: "US", price: { currency: "CNY", amount: 50 }, denominations: [{ currency: "CNY", amount: 50, value: 50 }, { currency: "CNY", amount: 100, value: 100 }], brand: "Airbnb", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m11", name: "Nintendo eShop 卡", description: "", category: "游戏", countryCode: "US", price: { currency: "CNY", amount: 20 }, denominations: [{ currency: "CNY", amount: 20, value: 20 }, { currency: "CNY", amount: 50, value: 50 }], brand: "Nintendo", type: "gift_card" as const, inStock: true, imageUrl: "" },
    { id: "m12", name: "Roblox 礼品卡", description: "", category: "游戏", countryCode: "US", price: { currency: "CNY", amount: 10 }, denominations: [{ currency: "CNY", amount: 10, value: 10 }, { currency: "CNY", amount: 25, value: 25 }], brand: "Roblox", type: "gift_card" as const, inStock: true, imageUrl: "" },
  ];
  return items;
}
