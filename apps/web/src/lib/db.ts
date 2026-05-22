/**
 * IndexedDB persistence for wallet data — multi-wallet schema.
 *
 * Keys in "wallet" object store:
 *   wallet:{id}     — JSON blob of WalletRecord
 *   wallet_ids      — ordered JSON array of wallet IDs
 *   active_wallet_id — string
 *
 * Migration: old single-wallet keys (keystore, mnemonic, accounts,
 * selectedAccountId) are migrated to the multi-wallet format on first load.
 */

import type { Account } from "./wallet";

const DB_NAME = "bitrefill-wallet";
const DB_VERSION = 1;
const STORE_NAME = "wallet";

export interface WalletRecord {
  id: string;
  name: string;
  keystore: string;
  mnemonic: string;
  accounts: Account[];
  selectedAccountId: string | null;
  createdAt: number;
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
  fn: (store: IDBObjectStore) => void
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

async function getFromStore<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

// ---- Migration from single-wallet to multi-wallet ----

async function migrateIfNeeded(): Promise<void> {
  const oldKeystore = await getFromStore<string>("keystore");
  if (!oldKeystore) return; // nothing to migrate

  const oldMnemonic = await getFromStore<string>("mnemonic");
  const oldAccounts = await getFromStore<Account[]>("accounts");
  const oldSelectedId = await getFromStore<string>("selectedAccountId");

  const id = crypto.randomUUID();
  const record: WalletRecord = {
    id,
    name: "钱包 1",
    keystore: oldKeystore,
    mnemonic: oldMnemonic || "",
    accounts: oldAccounts || [],
    selectedAccountId: oldSelectedId || null,
    createdAt: Date.now(),
  };

  await withStore("readwrite", (store) => {
    store.put(JSON.stringify(record), `wallet:${id}`);
    store.put(JSON.stringify([id]), "wallet_ids");
    store.put(id, "active_wallet_id");
    // Delete old keys
    store.delete("keystore");
    store.delete("mnemonic");
    store.delete("accounts");
    store.delete("selectedAccountId");
  });
}

// ---- Public API ----

export async function saveWallet(record: WalletRecord): Promise<void> {
  if (!indexedDB) return;
  await withStore("readwrite", (store) => {
    store.put(JSON.stringify(record), `wallet:${record.id}`);
  });
}

export async function loadWallets(): Promise<WalletRecord[]> {
  if (!indexedDB) return [];
  await migrateIfNeeded();

  const ids = await getFromStore<string[]>("wallet_ids");
  if (!ids || ids.length === 0) return [];

  const records: WalletRecord[] = [];
  for (const id of ids) {
    const raw = await getFromStore<string>(`wallet:${id}`);
    if (raw) {
      try {
        records.push(JSON.parse(raw));
      } catch { /* corrupt entry */ }
    }
  }
  return records;
}

export async function deleteWallet(id: string): Promise<void> {
  if (!indexedDB) return;
  await withStore("readwrite", (store) => {
    store.delete(`wallet:${id}`);
  });
  // Also remove from wallet_ids list
  const ids = (await getFromStore<string[]>("wallet_ids")) || [];
  const next = ids.filter((i) => i !== id);
  await withStore("readwrite", (store) => {
    store.put(JSON.stringify(next), "wallet_ids");
  });
  // Clear active if this was active
  const active = await getFromStore<string>("active_wallet_id");
  if (active === id) {
    await withStore("readwrite", (store) => {
      store.delete("active_wallet_id");
    });
  }
}

export async function setActiveWalletId(id: string): Promise<void> {
  if (!indexedDB) return;
  await withStore("readwrite", (store) => {
    store.put(id, "active_wallet_id");
  });
}

export async function getActiveWalletId(): Promise<string | null> {
  if (!indexedDB) return null;
  return (await getFromStore<string>("active_wallet_id")) || null;
}

export async function addWalletToList(id: string): Promise<void> {
  if (!indexedDB) return;
  const ids = (await getFromStore<string[]>("wallet_ids")) || [];
  if (!ids.includes(id)) {
    ids.push(id);
    await withStore("readwrite", (store) => {
      store.put(JSON.stringify(ids), "wallet_ids");
    });
  }
}

export async function clearAllWallets(): Promise<void> {
  if (!indexedDB) return;
  const ids = (await getFromStore<string[]>("wallet_ids")) || [];
  await withStore("readwrite", (store) => {
    for (const id of ids) {
      store.delete(`wallet:${id}`);
    }
    store.delete("wallet_ids");
    store.delete("active_wallet_id");
    // Also clean old format keys
    store.delete("keystore");
    store.delete("mnemonic");
    store.delete("accounts");
    store.delete("selectedAccountId");
  });
}

export async function isDatabaseAvailable(): Promise<boolean> {
  return typeof indexedDB !== "undefined";
}
