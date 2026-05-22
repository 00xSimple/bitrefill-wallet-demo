/**
 * Browser wallet (MetaMask, etc.) detection and connection.
 */

import type { Account, ChainType } from "./wallet";

interface EIP6963ProviderDetail {
  info: { name: string; icon: string; rdns: string };
  provider: EIP1193Provider;
}

interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider & { isMetaMask?: boolean; providers?: EIP1193Provider[] };
  }
}

export interface BrowserWalletAccount {
  address: string;
  chainId: string;
  chainName: string;
}

const CHAIN_ID_MAP: Record<string, { name: string; symbol: string }> = {
  "0x1": { name: "Ethereum", symbol: "ETH" },
  "0xa4b1": { name: "Arbitrum", symbol: "ETH" },
  "0x2105": { name: "Base", symbol: "ETH" },
  "0x89": { name: "Polygon", symbol: "POL" },
  "0x38": { name: "BSC", symbol: "BNB" },
  "0xa": { name: "Optimism", symbol: "ETH" },
  "0xe708": { name: "Linea", symbol: "ETH" },
  "0x144": { name: "zkSync", symbol: "ETH" },
  "0x2a": { name: "Kroma", symbol: "ETH" },
};

function getChainInfo(chainId: string): { name: string; symbol: string } {
  return CHAIN_ID_MAP[chainId] ?? { name: `Chain ${chainId}`, symbol: "ETH" };
}

function getProvider(): EIP1193Provider | null {
  const w = window;
  if (!w.ethereum) return null;

  // EIP-6963: multiple providers
  if (w.ethereum.providers?.length) {
    return w.ethereum.providers[0]!;
  }
  return w.ethereum;
}

export function isBrowserWalletAvailable(): boolean {
  return getProvider() !== null;
}

export async function connectBrowserWallet(): Promise<BrowserWalletAccount[]> {
  const provider = getProvider();
  if (!provider) throw new Error("未检测到浏览器钱包插件 (如 MetaMask)");

  const addresses: string[] = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];

  const chainId: string = (await provider.request({
    method: "eth_chainId",
  })) as string;

  const info = getChainInfo(chainId);

  return addresses.map((address) => ({
    address,
    chainId,
    chainName: info.name,
  }));
}

export async function getConnectedAccounts(): Promise<BrowserWalletAccount[]> {
  const provider = getProvider();
  if (!provider) return [];

  try {
    const addresses: string[] = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    if (!addresses.length) return [];

    const chainId: string = (await provider.request({
      method: "eth_chainId",
    })) as string;

    const info = getChainInfo(chainId);

    return addresses.map((address) => ({
      address,
      chainId,
      chainName: info.name,
    }));
  } catch {
    return [];
  }
}

export function listenBrowserWallet(
  onAccountsChanged: (accounts: BrowserWalletAccount[]) => void,
  onChainChanged: (chainId: string) => void
): () => void {
  const provider = getProvider();
  if (!provider) return () => {};

  const handleAccounts = (addrs: unknown) => {
    const addresses = addrs as string[];
    if (addresses.length === 0) {
      onAccountsChanged([]);
      return;
    }
    // re-fetch full account info
    getConnectedAccounts().then(onAccountsChanged).catch(() => {});
  };

  const handleChain = (chainId: unknown) => {
    onChainChanged(chainId as string);
  };

  provider.on("accountsChanged", handleAccounts);
  provider.on("chainChanged", handleChain);

  return () => {
    provider.removeListener("accountsChanged", handleAccounts);
    provider.removeListener("chainChanged", handleChain);
  };
}

export function browserAccountToWalletAccount(acct: BrowserWalletAccount): Account {
  return {
    address: acct.address,
    chain: "ETHEREUM" as ChainType,
    derivationPath: "browser",
  };
}
