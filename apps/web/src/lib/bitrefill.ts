/**
 * Bitrefill API client — browse gift cards, create invoices, check orders.
 *
 * Base URL: https://api.bitrefill.com/v2
 * Auth: Bearer token in Authorization header
 * Docs: https://docs.bitrefill.com
 */

const API_BASE = "/api/bitrefill";

export interface BitrefillProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  countryCode: string;
  countryName?: string;
  termsAndConditions?: string;
  price: {
    currency: string;
    amount: number;
  };
  denominations: Array<{
    currency: string;
    amount: number;
    value: number;
  }>;
  imageUrl?: string;
  brand?: string;
  type: "gift_card" | "mobile_topup" | "esim";
  inStock: boolean;
  deliveryEstimate?: string;
}

export interface BitrefillInvoice {
  id: string;
  status: "pending" | "paid" | "delivered" | "expired" | "failed";
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentAddress?: string;
  paymentAmount?: string;
  paymentCurrency?: string;
  createdAt: string;
  expiresAt?: string;
  deliveryDetails?: {
    code?: string;
    instructions?: string;
    pin?: string;
  };
}

export interface BitrefillCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export const PAYMENT_METHODS: Record<string, string> = {
  ETHEREUM: "ethereum",
  TRON: "tron",
  BITCOIN: "bitcoin",
  LITECOIN: "litecoin",
  DOGECOIN: "dogecoin",
};

export type BitrefillPaymentMethod = keyof typeof PAYMENT_METHODS;

// ---- Data mapping ----

function mapInvoice(raw: any): BitrefillInvoice {
  const firstProduct = Array.isArray(raw.products) ? raw.products[0] : null;
  return {
    id: raw.id,
    status: raw.status || "pending",
    productId: raw.product_id || firstProduct?.product_id || raw.productId || "",
    productName: raw.product_name || raw.productName || firstProduct?.name || "",
    amount: raw.amount ?? firstProduct?.amount ?? 0,
    currency: raw.currency || firstProduct?.currency || "CNY",
    paymentMethod: raw.payment_method || raw.paymentMethod || "ethereum",
    paymentAddress: raw.payment_address || raw.paymentAddress || "",
    paymentAmount: raw.payment_amount || raw.paymentAmount || "",
    paymentCurrency: raw.payment_currency || raw.paymentCurrency || "",
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    expiresAt: raw.expires_at || raw.expiresAt || "",
    deliveryDetails: raw.delivery_details || raw.deliveryDetails
      ? {
          code: raw.delivery_details?.code || raw.deliveryDetails?.code || "",
          instructions: raw.delivery_details?.instructions || raw.deliveryDetails?.instructions || "",
          pin: raw.delivery_details?.pin || raw.deliveryDetails?.pin || "",
        }
      : undefined,
  };
}

function mapProduct(raw: any): BitrefillProduct {
  const packages = raw.packages || [];
  const categories: string[] = raw.categories || [];

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || "",
    category: categories[0] || "",
    countryCode: raw.country_code || "",
    countryName: raw.country_name || "",
    termsAndConditions: raw.termsAndConditions
      ? raw.termsAndConditions.replace(/\\r\\n/g, "\n").replace(/<br>/g, "\n")
      : "",
    price: {
      currency: "CNY",
      amount: packages[0]?.amount ?? 0,
    },
    denominations: packages.map((p: any) => ({
      currency: "CNY",
      amount: p.amount ?? 0,
      value: Number(p.value) || p.amount || 0,
    })),
    imageUrl: raw.id
      ? `https://cdn.bitrefill.com/primg/w720h432/${raw.id}.webp`
      : "",
    brand: raw.country_name || "",
    type: categories.includes("esim")
      ? "esim"
      : categories.some((c: string) => c === "refill" || c === "data" || c === "bundles")
        ? "mobile_topup"
        : "gift_card",
    inStock: raw.in_stock === true,
  };
}

// ---- API Client ----

class BitrefillClient {
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Bitrefill API error ${res.status}: ${body.slice(0, 200)}`
      );
    }

    return res.json();
  }

  // ---- Products ----

  async getProducts(params?: {
    type?: string;
    country?: string;
    limit?: number;
    start?: number;
  }): Promise<{ products: BitrefillProduct[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.country) qs.set("country", params.country);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.start != null) qs.set("start", String(params.start));
    const query = qs.toString();
    const result = await this.request<any>(`/products${query ? `?${query}` : ""}`);
    // Normalize response: API may return array, { products }, or { data }
    if (Array.isArray(result)) {
      return { products: result.map(mapProduct), total: result.length };
    }
    const rawProducts = Array.isArray(result.products)
      ? result.products
      : Array.isArray(result.data)
        ? result.data
        : [];
    return {
      products: rawProducts.map(mapProduct),
      total: result.total ?? rawProducts.length,
    };
  }

  async getProduct(id: string): Promise<BitrefillProduct> {
    const result = await this.request<any>(`/products/${id}`);
    const raw = result.data ?? result;
    return mapProduct(raw);
  }

  async getCategories(): Promise<BitrefillCategory[]> {
    const result = await this.request<any>("/categories");
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.categories)) return result.categories;
    if (Array.isArray(result.data)) return result.data;
    return [];
  }

  async getCountries(): Promise<
    Array<{ code: string; name: string; currency: string }>
  > {
    return this.request("/countries");
  }

  // ---- Invoices / Payments ----

  async createInvoice(params: {
    productId: string;
    denomination?: number;
    paymentMethod: string;
    email?: string;
    phone?: string;
  }): Promise<BitrefillInvoice> {
    const productEntry: Record<string, unknown> = {
      product_id: params.productId,
      value: params.denomination,
    };
    if (params.phone) productEntry.phone_number = params.phone;

    const body: Record<string, unknown> = {
      products: [productEntry],
      payment_method: params.paymentMethod,
    };
    if (params.email) body.email = params.email;

    const result = await this.request<any>("/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapInvoice(result.data ?? result);
  }

  async getInvoice(id: string): Promise<BitrefillInvoice> {
    const result = await this.request<any>(`/invoices/${id}`);
    return mapInvoice(result.data ?? result);
  }

  async listInvoices(params?: {
    status?: string;
    limit?: number;
    start?: number;
  }): Promise<{ invoices: BitrefillInvoice[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.start != null) qs.set("start", String(params.start));
    const query = qs.toString();
    const result = await this.request<any>(`/invoices${query ? `?${query}` : ""}`);
    const raw = Array.isArray(result.data) ? result.data : Array.isArray(result.invoices) ? result.invoices : [];
    return {
      invoices: raw.map(mapInvoice),
      total: result.total ?? result.meta?.total ?? raw.length,
    };
  }

  // ---- Lookup / Utility ----

  async searchProducts(query: string, country = "CN"): Promise<BitrefillProduct[]> {
    const qs = new URLSearchParams({ q: query, country });
    const result = await this.request<any>(`/products/search?${qs.toString()}`);
    if (Array.isArray(result)) return result.map(mapProduct);
    if (Array.isArray(result.data)) return result.data.map(mapProduct);
    return [];
  }

  async getFeaturedProducts(): Promise<BitrefillProduct[]> {
    const result = await this.getProducts({ limit: 12 });
    return result.products;
  }
}

// ---- Singleton ----

let clientInstance: BitrefillClient | null = null;

export function getBitrefillClient(): BitrefillClient {
  if (!clientInstance) {
    clientInstance = new BitrefillClient();
  }
  return clientInstance;
}

// ---- Country / Currency formatting ----

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    KRW: "₩",
  };
  const symbol = symbols[currency] || currency + " ";
  if (currency === "JPY" || currency === "KRW") {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatCrypto(amount: number, symbol: string): string {
  if (amount < 0.001) return `${amount.toFixed(8)} ${symbol}`;
  if (amount < 1) return `${amount.toFixed(6)} ${symbol}`;
  return `${amount.toFixed(4)} ${symbol}`;
}
