/**
 * IndexedDB persistence for wallet data.
 *
 * Object store: "wallet" — single-row store for wallet state.
 * Keys: keystore, mnemonic, accounts, selectedAccountId
 */

const DB_NAME = "bitrefill-wallet";
const DB_VERSION = 1;
const STORE_NAME = "wallet";

export interface WalletDBData {
  keystore?: string | null;
  mnemonic?: string | null;
  accounts?: unknown;
  selectedAccountId?: string | null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB blocked — close other tabs"));
  });
}

async function withStore(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest | void
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    try {
      fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
  });
}

async function withStoreGet<T>(fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

// ---- Public API ----

export async function saveWalletData(data: WalletDBData): Promise<void> {
  if (!indexedDB) return;
  await withStore("readwrite", (store) => {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        store.put(value, key);
      }
    }
  });
}

export async function loadWalletData(): Promise<WalletDBData> {
  if (!indexedDB) return {};
  const keys = ["keystore", "mnemonic", "accounts", "selectedAccountId"] as const;

  const result: WalletDBData = {};
  for (const key of keys) {
    try {
      const value = await withStoreGet((store) => store.get(key));
      if (value !== undefined) {
        (result as Record<string, unknown>)[key] = value;
      }
    } catch {
      // Key not found — skip
    }
  }
  return result;
}

export async function clearWalletData(): Promise<void> {
  if (!indexedDB) return;
  await withStore("readwrite", (store) => {
    store.delete("keystore");
    store.delete("mnemonic");
    store.delete("accounts");
    store.delete("selectedAccountId");
  });
}

export async function isDatabaseAvailable(): Promise<boolean> {
  return typeof indexedDB !== "undefined";
}
