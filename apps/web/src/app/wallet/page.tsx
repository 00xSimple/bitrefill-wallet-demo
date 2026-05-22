"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
  SectionPanel,
  IconBox,
  useToast,
  Avatar,
} from "@repo/ui";
import {
  Wallet,
  Eye,
  EyeOff,
  Download,
  Copy,
  Trash2,
  Shield,
  ArrowRight,
  Plus,
  AlertTriangle,
  Loader2,
  Check,
  Unplug,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createKeystore,
  deriveAccounts,
  exportMnemonic,
  isWalletAvailable,
  type Account,
  type ChainType,
} from "@/lib/wallet";
import { useWalletStore } from "@/lib/store";
import type { WalletRecord } from "@/lib/db";

const CHAIN_OPTIONS: {
  chain: ChainType;
  label: string;
  path: string;
  icon: string;
}[] = [
  { chain: "ETHEREUM", label: "Ethereum", path: "m/44'/60'/0'/0/0", icon: "⟠" },
  { chain: "BITCOIN", label: "Bitcoin", path: "m/84'/0'/0'/0/0", icon: "₿" },
  { chain: "TRON", label: "Tron", path: "m/44'/195'/0'/0/0", icon: "⚡" },
  { chain: "LITECOIN", label: "Litecoin", path: "m/84'/2'/0'/0/0", icon: "Ł" },
  { chain: "DOGECOIN", label: "Dogecoin", path: "m/44'/3'/0'/0/0", icon: "Ð" },
  { chain: "COSMOS", label: "Cosmos", path: "m/44'/118'/0'/0/0", icon: "⚛" },
  { chain: "BITCOINCASH", label: "Bitcoin Cash", path: "m/44'/145'/0'/0/0", icon: "BCH" },
];

export default function WalletPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    wallets,
    keystoreJson,
    accounts,
    selectedAccount,
    isLocked,
    wasmAvailable,
    setKeystore,
    setMnemonic,
    setAccounts,
    selectAccount,
    setWasmAvailable,
    unlock,
    lock,
    reset,
    addWallet,
    switchWallet,
    removeWallet,
    hydrateFromDB,
    connectBrowserWallet,
    checkBrowserWallet,
  } = useWalletStore();

  const [view, setView] = useState<"manage" | "create" | "import">("manage");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState("");
  const [revealedMnemonic, setRevealedMnemonic] = useState("");
  const [unlockPw, setUnlockPw] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [selectedChains, setSelectedChains] = useState<Set<string>>(
    new Set(["ETHEREUM"])
  );
  const [checkingWasm, setCheckingWasm] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);
  const [browserConnecting, setBrowserConnecting] = useState(false);
  const hasBrowserWallet = wallets.some((w) => w.type === "browser");

  useEffect(() => {
    (async () => {
      const store = useWalletStore.getState();
      if (!store.hydrated) {
        await hydrateFromDB();
      }
      const available = await isWalletAvailable();
      setWasmAvailable(available);
      setCheckingWasm(false);

      const state = useWalletStore.getState();
      if (state.wallets.length === 0) {
        setView("create");
      }

      // Auto-restore browser wallet if not already connected
      if (!state.wallets.some((w) => w.type === "browser")) {
        await checkBrowserWallet();
      }
    })();
  }, []);

  // Reset create/import state when switching to those views
  const resetForm = () => {
    setPassword("");
    setMnemonicInput("");
    setGeneratedMnemonic("");
    setRevealedMnemonic("");
    setUnlockPw("");
    setUnlockError("");
    setSelectedChains(new Set(["ETHEREUM"]));
  };

  // ---- Create wallet ----
  const handleCreate = async () => {
    if (!password || password.length < 6) {
      toast({ title: "密码至少6位", variant: "error" });
      return;
    }
    if (!wasmAvailable) {
      toast({ title: "Token Core 不可用", description: "请检查网络连接后刷新页面", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const ks = await createKeystore({ password });
      const mnemonic = await exportMnemonic(ks, password);

      const chainDerivations = Array.from(selectedChains).map((c) => {
        const opt = CHAIN_OPTIONS.find((o) => o.chain === c)!;
        return { chain: opt.chain, derivationPath: opt.path };
      });
      const accts = await deriveAccounts(ks, password, chainDerivations);

      const name = `钱包 ${wallets.length + 1}`;
      const record: WalletRecord = {
        id: crypto.randomUUID(),
        name,
        type: "keystore",
        keystore: ks,
        mnemonic,
        accounts: accts,
        selectedAccountId: accts[0]?.address ?? null,
        createdAt: Date.now(),
      };

      addWallet(record);
      unlock();
      setGeneratedMnemonic(mnemonic);

      toast({
        title: `${name} 创建成功`,
        description: `已派生 ${accts.length} 个账户`,
        variant: "success",
      });
    } catch (e: any) {
      toast({ title: "创建失败", description: e.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---- Import wallet ----
  const handleImport = async () => {
    if (!mnemonicInput.trim()) {
      toast({ title: "请输入助记词", variant: "error" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "密码至少6位", variant: "error" });
      return;
    }
    if (!wasmAvailable) {
      toast({ title: "Token Core 不可用", description: "请检查网络连接后刷新页面", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const ks = await createKeystore({
        password,
        mnemonic: mnemonicInput.trim(),
      });

      const chainDerivations = Array.from(selectedChains).map((c) => {
        const opt = CHAIN_OPTIONS.find((o) => o.chain === c)!;
        return { chain: opt.chain, derivationPath: opt.path };
      });
      const accts = await deriveAccounts(ks, password, chainDerivations);

      const name = `钱包 ${wallets.length + 1}`;
      const record: WalletRecord = {
        id: crypto.randomUUID(),
        name,
        type: "keystore",
        keystore: ks,
        mnemonic: mnemonicInput.trim(),
        accounts: accts,
        selectedAccountId: accts[0]?.address ?? null,
        createdAt: Date.now(),
      };

      addWallet(record);
      unlock();
      setGeneratedMnemonic(mnemonicInput.trim());

      toast({
        title: `${name} 导入成功`,
        description: `已派生 ${accts.length} 个账户`,
        variant: "success",
      });
    } catch (e: any) {
      toast({ title: "导入失败", description: e.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---- Switch wallet ----
  const handleSwitchWallet = (id: string) => {
    switchWallet(id);
    lock();
    toast({ title: "已切换钱包", variant: "info" });
  };

  // ---- Remove wallet ----
  const handleRemoveWallet = (id: string) => {
    const wallet = wallets.find((w) => w.id === id);
    removeWallet(id);
    toast({ title: `${wallet?.name ?? "钱包"} 已删除`, variant: "info" });
    if (wallets.length <= 1) {
      reset();
      setView("create");
    }
  };

  // ---- Reveal mnemonic ----
  const handleRevealMnemonic = async () => {
    if (!keystoreJson || !unlockPw) {
      setUnlockError("请输入密码");
      return;
    }
    setUnlockError("");
    try {
      const m = await exportMnemonic(keystoreJson, unlockPw);
      setRevealedMnemonic(m);
    } catch {
      setUnlockError("密码错误或无法解密");
    }
  };

  // ---- Connect browser wallet ----
  const handleConnectBrowser = async () => {
    setBrowserConnecting(true);
    try {
      await connectBrowserWallet();
      toast({ title: "浏览器钱包已连接", variant: "success" });
    } catch (e: any) {
      toast({ title: "连接失败", description: e.message, variant: "error" });
    } finally {
      setBrowserConnecting(false);
    }
  };

  // ---- Disconnect browser wallet ----
  const handleDisconnectBrowser = () => {
    const store = useWalletStore.getState();
    store.disconnectBrowserWallet();
    toast({ title: "浏览器钱包已断开", variant: "info" });
  };

  // ---- Disconnect all ----
  const handleResetAll = () => {
    reset();
    setView("create");
    resetForm();
    setCreatingNew(false);
    toast({ title: "所有钱包已断开", variant: "info" });
  };

  const toggleChain = (chain: string) => {
    setSelectedChains((prev) => {
      const next = new Set(prev);
      if (next.has(chain) && next.size === 1) return prev;
      if (next.has(chain)) next.delete(chain);
      else next.add(chain);
      return next;
    });
  };

  // ---- Loading ----
  if (checkingWasm) {
    return (
      <div className="page-enter flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="size-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-[var(--muted-foreground)]">正在初始化钱包模块...</p>
        </div>
      </div>
    );
  }

  // ---- WASM unavailable and no wallets ----
  if (!wasmAvailable && wallets.length === 0) {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-title-lg text-[var(--foreground)]">钱包管理</h1>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
            创建、导入或管理你的多链加密钱包
          </p>
        </div>

        <SectionPanel padding="lg" className="max-w-lg border-[var(--warning)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Token Core 未加载
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">
                WebAssembly 模块未能加载。请检查网络连接后刷新页面重试。
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                刷新页面
              </Button>
            </div>
          </div>
        </SectionPanel>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-title-lg text-[var(--foreground)]">钱包管理</h1>
          <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
            {wallets.length > 0
              ? `管理 ${wallets.length} 个钱包，支持多链账户`
              : "创建或导入你的加密钱包"}
          </p>
        </div>
        {wallets.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              resetForm();
              setCreatingNew(true);
              setView("create");
            }}>
              <Plus className="size-3.5" />
              添加钱包
            </Button>
            <Button variant="destructive" size="sm" onClick={handleResetAll}>
              <Trash2 className="size-3.5" />
              断开全部
            </Button>
          </div>
        )}
      </div>

      {/* Create/Import form (shown when creating new or no wallets yet) */}
      {(view !== "manage" || creatingNew) && (
        <>
          {!generatedMnemonic && !creatingNew && wallets.length === 0 && (
            <div className="flex gap-2">
              {(["create", "import"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    view === t
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)]"
                  }`}
                >
                  {t === "create" ? "创建钱包" : "导入钱包"}
                </button>
              ))}
            </div>
          )}

          {!generatedMnemonic && creatingNew && (
            <div className="flex gap-2">
              {(["create", "import"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    view === t
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)]"
                  }`}
                >
                  {t === "create" ? "创建钱包" : "导入钱包"}
                </button>
              ))}
              <button
                onClick={() => { setCreatingNew(false); setView("manage"); }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--secondary)] text-[var(--foreground)]"
              >
                取消
              </button>
            </div>
          )}

          {!generatedMnemonic && (view === "create") && (
            <SectionPanel padding="lg" className="max-w-lg">
              <IconBox variant="primary-soft" size="sm" className="mb-4">
                <Wallet className="size-5" />
              </IconBox>
              <h2 className="text-title-sm text-[var(--foreground)] mb-1">
                {creatingNew ? "添加新钱包" : "创建新钱包"}
              </h2>
              <p className="text-body-sm text-[var(--muted-foreground)] mb-6">
                使用 Token Core 生成安全的 HD 钱包
              </p>

              <div className="space-y-4">
                <Input
                  label="钱包密码"
                  type={showPw ? "text" : "password"}
                  placeholder="至少6位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightIcon={
                    <button onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                />

                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">选择链</p>
                  <div className="flex flex-wrap gap-2">
                    {CHAIN_OPTIONS.map((opt) => (
                      <button
                        key={opt.chain}
                        onClick={() => toggleChain(opt.chain)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedChains.has(opt.chain)
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--secondary)] text-[var(--foreground)]"
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleCreate} loading={loading}>
                  <Plus className="size-4" />
                  创建钱包
                </Button>
              </div>
            </SectionPanel>
          )}

          {!generatedMnemonic && (view === "import") && (
            <SectionPanel padding="lg" className="max-w-lg">
              <IconBox variant="primary-soft" size="sm" className="mb-4">
                <Download className="size-5" />
              </IconBox>
              <h2 className="text-title-sm text-[var(--foreground)] mb-1">
                {creatingNew ? "导入另一个钱包" : "导入钱包"}
              </h2>
              <p className="text-body-sm text-[var(--muted-foreground)] mb-6">
                使用已有的助记词恢复钱包
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">助记词</label>
                  <textarea
                    className="mt-1.5 h-24 w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]/50 resize-none"
                    placeholder="输入12或24个助记词，用空格分隔"
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                  />
                </div>

                <Input
                  label="钱包密码"
                  type={showPw ? "text" : "password"}
                  placeholder="至少6位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightIcon={
                    <button onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                />

                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">选择链</p>
                  <div className="flex flex-wrap gap-2">
                    {CHAIN_OPTIONS.map((opt) => (
                      <button
                        key={opt.chain}
                        onClick={() => toggleChain(opt.chain)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedChains.has(opt.chain)
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--secondary)] text-[var(--foreground)]"
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleImport} loading={loading}>
                  <Download className="size-4" />
                  导入钱包
                </Button>
              </div>
            </SectionPanel>
          )}

          {/* Backup mnemonic after create/import */}
          {generatedMnemonic && (view === "create" || view === "import") && (
            <SectionPanel padding="lg" className="max-w-lg border-[var(--warning)]">
              <div className="flex items-start gap-3">
                <Shield className="size-5 text-[var(--warning)] shrink-0 mt-0.5" />
                <div className="w-full">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">备份助记词</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-3">
                    请安全保存以下助记词。不要分享给任何人。
                  </p>
                  <div className="bg-[var(--surface-blue)] rounded-lg p-3 font-mono text-sm text-[var(--foreground)] break-words select-all">
                    {generatedMnemonic}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedMnemonic);
                        toast({ title: "已复制", variant: "success" });
                      }}
                    >
                      <Copy className="size-3.5" />
                      复制
                    </Button>
                    <Button size="sm" onClick={() => {
                      setGeneratedMnemonic("");
                      setCreatingNew(false);
                      setView("manage");
                    }}>
                      已安全保存
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </SectionPanel>
          )}
        </>
      )}

      {/* Browser wallet connect card (no browser wallet connected yet) */}
      {view === "manage" && !hasBrowserWallet && !creatingNew && (
        <SectionPanel padding="lg" className="max-w-lg border-dashed border-[var(--border)]">
          <div className="flex items-center gap-4">
            <IconBox variant="primary-soft" size="sm">
              <Globe className="size-5" />
            </IconBox>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">连接浏览器钱包</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                通过 MetaMask 等浏览器插件连接钱包地址
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectBrowser}
              loading={browserConnecting}
            >
              <Unplug className="size-3.5" />
              连接
            </Button>
          </div>
        </SectionPanel>
      )}

      {/* Wallet list (manage view) */}
      {view === "manage" && wallets.length > 0 && !creatingNew && (
        <div className="space-y-6">
          {wallets.map((wallet) => {
            const isBrowser = wallet.type === "browser";
            const isActive = wallet.id === useWalletStore.getState().activeWalletId;
            return (
              <SectionPanel key={wallet.id} padding="lg">
                {/* Wallet header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <IconBox variant={isActive ? "primary" : "primary-soft"} size="sm">
                      {isBrowser ? <Globe className="size-5" /> : <Wallet className="size-5" />}
                    </IconBox>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-title-sm text-[var(--foreground)]">
                          {wallet.name}
                        </h2>
                        {isBrowser && (
                          <Badge variant="primary" size="sm">浏览器</Badge>
                        )}
                        {isActive ? (
                          <Badge variant="success" size="sm">
                            <Check className="size-3" />
                            当前
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">未激活</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {wallet.accounts.length} 个账户
                        {!isBrowser && <> · 创建于 {new Date(wallet.createdAt).toLocaleDateString("zh-CN")}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isActive && (
                      <Button variant="primary" size="sm" onClick={() => handleSwitchWallet(wallet.id)}>
                        切换至此钱包
                      </Button>
                    )}
                    {isBrowser ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDisconnectBrowser}
                      >
                        <Unplug className="size-3.5" />
                        断开连接
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveWallet(wallet.id)}
                      >
                        <Trash2 className="size-3.5" />
                        删除
                      </Button>
                    )}
                  </div>
                </div>

                {/* Accounts for active wallet */}
                {isActive && (
                  <div>
                    <h3 className="text-title-sm text-[var(--foreground)] mb-4">
                      我的账户
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wallet.accounts.map((acct, i) => (
                        <Card
                          key={i}
                          className={`cursor-pointer transition-shadow ${
                            selectedAccount?.address === acct.address
                              ? "ring-2 ring-[var(--primary)]"
                              : ""
                          }`}
                          onClick={() => selectAccount(acct)}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                fallback={acct.chain.slice(0, 2)}
                                bgColor="var(--surface-blue-dim)"
                              />
                              <div className="flex-1">
                                <CardTitle>{acct.chain}</CardTitle>
                                <CardDescription>{acct.derivationPath}</CardDescription>
                              </div>
                              <Badge
                                variant={
                                  selectedAccount?.address === acct.address ? "primary" : "neutral"
                                }
                                size="sm"
                              >
                                {selectedAccount?.address === acct.address ? "当前" : "可选"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs font-mono text-[var(--foreground)] break-all">
                              {acct.address}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(acct.address);
                                toast({ title: "地址已复制", variant: "success" });
                              }}
                            >
                              <Copy className="size-3.5" />
                              复制地址
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>

                    {/* Reveal mnemonic for active wallet (keystore wallets only) */}
                    {!isBrowser && (
                      <SectionPanel padding="md" className="max-w-lg mt-4">
                        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                          查看助记词
                        </h3>
                        <p className="text-2xs text-[var(--muted-foreground)] mb-3">
                          需要密码才能查看。切勿向任何人透露你的助记词。
                        </p>
                        <div className="flex gap-3">
                          <Input
                            type="password"
                            placeholder="输入钱包密码"
                            value={unlockPw}
                            onChange={(e) => {
                              setUnlockPw(e.target.value);
                              setUnlockError("");
                            }}
                            error={unlockError}
                            className="flex-1"
                          />
                          <Button onClick={handleRevealMnemonic}>
                            <Eye className="size-4" />
                            查看
                          </Button>
                        </div>
                        {revealedMnemonic && (
                          <div className="mt-4 bg-[var(--surface-blue)] rounded-lg p-3 font-mono text-sm text-[var(--foreground)] break-words select-all">
                            {revealedMnemonic}
                          </div>
                        )}
                      </SectionPanel>
                    )}
                  </div>
                )}
              </SectionPanel>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      {wallets.length > 0 && view === "manage" && !creatingNew && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => { resetForm(); setCreatingNew(true); setView("create"); }}>
            <Plus className="size-3.5" />
            添加钱包
          </Button>
          <Button onClick={() => router.push("/products")}>
            去购物
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
