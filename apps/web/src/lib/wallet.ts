/**
 * Wallet module — wraps @consenlabs/tcx-wasm for keystore management,
 * account derivation, and transaction signing.
 *
 * All tcx-wasm APIs accept and return JSON strings. This module provides
 * typed wrappers around those calls. The WASM module is loaded lazily at
 * runtime to avoid build-time webpack issues.
 */

// ---- Types ----

export interface KeystoreParams {
  password?: string;
  prfKey?: string;
  userId?: string;
  credentialId?: string;
  rpId?: string;
  mnemonic?: string;
  entropy?: string;
  network?: "MAINNET" | "TESTNET";
}

export interface DerivationRequest {
  chain: ChainType;
  derivationPath: string;
  chainId?: string;
  network?: "MAINNET" | "TESTNET";
  segWit?: "NONE" | "P2WPKH" | "VERSION_0" | "VERSION_1";
}

export interface Account {
  address: string;
  chain: ChainType;
  derivationPath: string;
  publicKey?: string;
}

export interface TxInput {
  nonce?: string;
  gasPrice?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  to: string;
  value: string;
  chainId?: string;
  data?: string;
}

export type ChainType =
  | "ETHEREUM"
  | "TRON"
  | "BITCOIN"
  | "BITCOINCASH"
  | "LITECOIN"
  | "DOGECOIN"
  | "COSMOS"
  | "EOS"
  | "TEZOS"
  | "TON"
  | "NERVOS"
  | "POLKADOT"
  | "KUSAMA";

// ---- WASM Module Cache ----

interface TcxWasm {
  default: () => Promise<void>;
  create_keystore: (params: string) => string;
  export_mnemonic: (params: string) => string;
  derive_accounts: (params: string) => string;
  cache_keystore: (keystoreJson: string) => void;
  clear_cached_keystore: () => void;
  sign_tx: (params: string) => string;
  sign_txs: (params: string) => string;
  sign_message: (params: string) => string;
  sign_psbt: (params: string) => string;
  sign_psbts: (params: string) => string;
  encrypt_message: (params: string) => string;
  decrypt_message: (params: string) => string;
  derive_message_key_pair: (params: string) => string;
  sign_message_event: (params: string) => string;
}

let wasmModule: TcxWasm | null = null;
let initPromise: Promise<TcxWasm | null> | null = null;

async function getWasm(): Promise<TcxWasm | null> {
  if (wasmModule) return wasmModule;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Use new Function to bypass webpack — load WASM from public/wasm/
      const tcx = (await new Function(
        "return import('/wasm/tcx_wasm.js')"
      )()) as unknown as TcxWasm;
      await tcx.default();
      wasmModule = tcx;
      return tcx;
    } catch {
      return null;
    }
  })();

  return initPromise;
}

// ---- Public API ----

export async function isWalletAvailable(): Promise<boolean> {
  const m = await getWasm();
  return m !== null;
}

export async function createKeystore(params: KeystoreParams): Promise<string> {
  const m = await getWasm();
  if (!m) throw new Error("Wallet module not available — using demo mode");
  return m.create_keystore(JSON.stringify(params));
}

export async function exportMnemonic(
  keystoreJson: string,
  key: string
): Promise<string> {
  const m = await getWasm();
  if (!m) throw new Error("Wallet module not available — using demo mode");
  const result = m.export_mnemonic(
    JSON.stringify({ keystoreJson, key })
  );
  return JSON.parse(result).mnemonic;
}

export async function deriveAccounts(
  keystoreJson: string,
  key: string,
  derivations: DerivationRequest[]
): Promise<Account[]> {
  const m = await getWasm();
  if (!m) throw new Error("Wallet module not available — using demo mode");
  const result = m.derive_accounts(
    JSON.stringify({ keystoreJson, key, derivations })
  );
  return JSON.parse(result);
}

export async function cacheKeystore(keystoreJson: string): Promise<void> {
  const m = await getWasm();
  if (m) m.cache_keystore(keystoreJson);
}

export function clearCachedKeystore(): void {
  if (wasmModule) wasmModule.clear_cached_keystore();
}

export async function signTransaction(
  keystoreJson: string,
  key: string,
  chain: ChainType,
  derivationPath: string,
  input: TxInput
): Promise<{ signature: string; txHash: string }> {
  const m = await getWasm();
  if (!m) throw new Error("Wallet module not available — using demo mode");
  const result = m.sign_tx(
    JSON.stringify({ keystoreJson, key, chain, derivationPath, input })
  );
  return JSON.parse(result);
}

export async function signMessage(
  keystoreJson: string,
  key: string,
  chain: ChainType,
  message: string,
  signatureType: "PersonalSign" | "EcSign" = "PersonalSign"
): Promise<{ signature: string }> {
  const m = await getWasm();
  if (!m) throw new Error("Wallet module not available — using demo mode");
  const result = m.sign_message(
    JSON.stringify({
      keystoreJson,
      key,
      chain,
      input: { message, signatureType },
    })
  );
  return JSON.parse(result);
}

// ---- Test mnemonic for demo ----

export const DEMO_MNEMONIC =
  "inject kidney empty canal shadow pact comfort wife crush horse wife sketch";
export const DEMO_PASSWORD = "demo123456";
