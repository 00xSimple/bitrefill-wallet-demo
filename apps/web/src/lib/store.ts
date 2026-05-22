import { create } from "zustand";
import type { Account } from "./wallet";
import type { BitrefillProduct, BitrefillInvoice } from "./bitrefill";
import {
  saveWallet,
  loadWallets,
  deleteWallet,
  setActiveWalletId,
  getActiveWalletId,
  addWalletToList,
  clearAllWallets,
  isDatabaseAvailable,
  type WalletRecord,
} from "./db";

// ---- Wallet State ----

export interface WalletState {
  wallets: WalletRecord[];
  activeWalletId: string | null;

  // Derived from active wallet
  keystoreJson: string | null;
  mnemonic: string | null;
  accounts: Account[];
  selectedAccount: Account | null;

  isLocked: boolean;
  wasmAvailable: boolean;
  hydrated: boolean;

  setKeystore: (json: string) => void;
  setMnemonic: (mnemonic: string) => void;
  setAccounts: (accounts: Account[]) => void;
  selectAccount: (account: Account | null) => void;
  setWasmAvailable: (v: boolean) => void;
  lock: () => void;
  unlock: () => void;
  reset: () => void;

  // Multi-wallet
  addWallet: (record: WalletRecord) => void;
  switchWallet: (id: string) => void;
  removeWallet: (id: string) => void;

  hydrateFromDB: () => Promise<void>;
}

function pickActiveWallet(wallets: WalletRecord[], id: string | null) {
  if (!id || wallets.length === 0) {
    return {
      keystoreJson: null,
      mnemonic: null,
      accounts: [] as Account[],
      selectedAccount: null as Account | null,
      activeWalletId: null as string | null,
    };
  }
  const wallet = wallets.find((w) => w.id === id) ?? wallets[0]!;
  const accounts = wallet.accounts;
  const selectedAccount = wallet.selectedAccountId
    ? accounts.find((a) => a.address === wallet.selectedAccountId) ?? accounts[0] ?? null
    : accounts[0] ?? null;
  return {
    keystoreJson: wallet.keystore,
    mnemonic: wallet.mnemonic,
    accounts,
    selectedAccount,
    activeWalletId: wallet.id,
  };
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallets: [],
  activeWalletId: null,
  keystoreJson: null,
  mnemonic: null,
  accounts: [],
  selectedAccount: null,
  isLocked: true,
  wasmAvailable: false,
  hydrated: false,

  // ---- Primitive setters (update active wallet in list) ----

  setKeystore: (json) => {
    const { wallets, activeWalletId } = get();
    const idx = wallets.findIndex((w) => w.id === activeWalletId);
    if (idx >= 0) {
      const updated = [...wallets];
      updated[idx] = { ...updated[idx]!, keystore: json };
      set({ wallets: updated, keystoreJson: json });
      saveWallet(updated[idx]!).catch(() => {});
    }
  },

  setMnemonic: (mnemonic) => {
    const { wallets, activeWalletId } = get();
    const idx = wallets.findIndex((w) => w.id === activeWalletId);
    if (idx >= 0) {
      const updated = [...wallets];
      updated[idx] = { ...updated[idx]!, mnemonic };
      set({ wallets: updated, mnemonic });
      saveWallet(updated[idx]!).catch(() => {});
    }
  },

  setAccounts: (accounts) => {
    const { wallets, activeWalletId } = get();
    const idx = wallets.findIndex((w) => w.id === activeWalletId);
    if (idx >= 0) {
      const updated = [...wallets];
      const sel = accounts[0] ?? null;
      updated[idx] = { ...updated[idx]!, accounts, selectedAccountId: sel?.address ?? null };
      set({ wallets: updated, accounts, selectedAccount: sel });
      saveWallet(updated[idx]!).catch(() => {});
    }
  },

  selectAccount: (account) => {
    const { wallets, activeWalletId } = get();
    const idx = wallets.findIndex((w) => w.id === activeWalletId);
    if (idx >= 0) {
      const updated = [...wallets];
      updated[idx] = { ...updated[idx]!, selectedAccountId: account?.address ?? null };
      set({ wallets: updated, selectedAccount: account });
      saveWallet(updated[idx]!).catch(() => {});
    }
  },

  setWasmAvailable: (v) => set({ wasmAvailable: v }),
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),

  reset: () => {
    set({
      wallets: [],
      activeWalletId: null,
      keystoreJson: null,
      mnemonic: null,
      accounts: [],
      selectedAccount: null,
      isLocked: true,
    });
    clearAllWallets().catch(() => {});
    useOrderStore.getState().setOrders([]);
  },

  // ---- Multi-wallet actions ----

  addWallet: (record) => {
    const { wallets } = get();
    const updated = [...wallets, record];
    const derived = pickActiveWallet(updated, record.id);
    set({ wallets: updated, ...derived });

    saveWallet(record).catch(() => {});
    addWalletToList(record.id).catch(() => {});
    setActiveWalletId(record.id).catch(() => {});
  },

  switchWallet: (id) => {
    const { wallets } = get();
    const derived = pickActiveWallet(wallets, id);
    set(derived);
    setActiveWalletId(id).catch(() => {});
    useOrderStore.getState().setOrders([]);
  },

  removeWallet: (id) => {
    const { wallets } = get();
    const next = wallets.filter((w) => w.id !== id);
    const newActiveId = id === get().activeWalletId
      ? next[0]?.id ?? null
      : get().activeWalletId;
    const derived = pickActiveWallet(next, newActiveId);
    set({ wallets: next, ...derived });
    deleteWallet(id).catch(() => {});
  },

  // ---- Hydrate ----

  hydrateFromDB: async () => {
    try {
      const available = await isDatabaseAvailable();
      if (!available) {
        set({ hydrated: true });
        return;
      }
      const wallets = await loadWallets();
      const activeId = await getActiveWalletId();
      const derived = pickActiveWallet(wallets, activeId);
      set({
        wallets,
        ...derived,
        isLocked: true,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));

// ---- Cart State ----

export interface CartItem {
  product: BitrefillProduct;
  denominationIndex: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: () => { amount: number; currency: string };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.product.id === item.product.id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === item.product.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  clearCart: () => set({ items: [] }),

  total: () => {
    const { items } = get();
    const amount = items.reduce((sum, item) => {
      const denom = item.product.denominations[item.denominationIndex];
      return sum + (denom?.amount ?? 0) * item.quantity;
    }, 0);
    const currency = items[0]?.product.denominations[0]?.currency ?? "USD";
    return { amount, currency };
  },
}));

// ---- Order History ----

interface OrderState {
  orders: BitrefillInvoice[];
  addOrder: (order: BitrefillInvoice) => void;
  updateOrder: (id: string, order: Partial<BitrefillInvoice>) => void;
  removeOrder: (id: string) => void;
  setOrders: (orders: BitrefillInvoice[]) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, update) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...update } : o
      ),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
  setOrders: (orders) => set({ orders }),
}));
