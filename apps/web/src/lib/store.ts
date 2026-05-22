import { create } from "zustand";
import type { Account } from "./wallet";
import type { BitrefillProduct, BitrefillInvoice } from "./bitrefill";
import { loadWalletData, saveWalletData, clearWalletData, isDatabaseAvailable } from "./db";

async function persistIfReady(state: WalletState) {
  if (!state.hydrated) return;
  await saveWalletData({
    keystore: state.keystoreJson,
    mnemonic: state.mnemonic,
    accounts: state.accounts,
    selectedAccountId: state.selectedAccount?.address || null,
  }).catch(() => {});
}

// ---- Wallet State ----

export interface WalletState {
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
  hydrateFromDB: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
    keystoreJson: null,
    mnemonic: null,
    accounts: [],
    selectedAccount: null,
    isLocked: true,
    wasmAvailable: false,
    hydrated: false,

    setKeystore: (json) => {
      set({ keystoreJson: json });
      persistIfReady(get());
    },
    setMnemonic: (mnemonic) => {
      set({ mnemonic });
      persistIfReady(get());
    },
    setAccounts: (accounts) => {
      set({
        accounts,
        selectedAccount: accounts[0] ?? null,
      });
      persistIfReady(get());
    },
    selectAccount: (account) => {
      set({ selectedAccount: account });
      persistIfReady(get());
    },
    setWasmAvailable: (v) => set({ wasmAvailable: v }),
    lock: () => set({ isLocked: true }),
    unlock: () => set({ isLocked: false }),

    reset: () => {
      set({
        keystoreJson: null,
        mnemonic: null,
        accounts: [],
        selectedAccount: null,
        isLocked: true,
      });
      clearWalletData().catch(() => {});
    },

    hydrateFromDB: async () => {
      try {
        const available = await isDatabaseAvailable();
        if (!available) {
          set({ hydrated: true });
          return;
        }
        const data = await loadWalletData();
        if (data.keystore) {
          set({
            keystoreJson: data.keystore,
            mnemonic: data.mnemonic || null,
            accounts: (data.accounts as Account[]) || [],
            selectedAccount: null,
            isLocked: true,
            hydrated: true,
          });
          // Select previously selected account if available
          if (data.selectedAccountId && Array.isArray(data.accounts)) {
            const acct = (data.accounts as Account[]).find(
              (a) => a.address === data.selectedAccountId
            );
            if (acct) set({ selectedAccount: acct });
          }
        } else {
          set({ hydrated: true });
        }
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
