"use client";

import React, { useState } from "react";
import { Button, Input, useToast } from "@repo/ui";
import { X, Send, Wallet, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { BitrefillInvoice } from "@/lib/bitrefill";
import type { Account } from "@/lib/wallet";
import { signTransaction } from "@/lib/wallet";

interface SendPaymentDialogProps {
  invoice: BitrefillInvoice;
  account: Account;
  keystoreJson: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
}

export function SendPaymentDialog({
  invoice,
  account,
  keystoreJson,
  open,
  onClose,
  onSuccess,
}: SendPaymentDialogProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    txHash?: string;
    error?: string;
  } | null>(null);

  if (!open) return null;

  const handleSend = async () => {
    if (!password) {
      toast({ title: "请输入钱包密码", variant: "warning" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const { txHash } = await signTransaction(
        keystoreJson,
        password,
        account.chain,
        account.derivationPath,
        {
          to: invoice.paymentAddress!,
          value: invoice.paymentAmount!,
        }
      );

      setResult({ success: true, txHash });
      onSuccess(txHash);
      toast({
        title: "交易已签名",
        description: `TxHash: ${txHash.slice(0, 20)}...`,
        variant: "success",
      });
    } catch (e: any) {
      const msg = e.message || "签名失败";
      setResult({ success: false, error: msg });
      toast({ title: "交易签名失败", description: msg, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !sending && onClose()}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--surface-page)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Send className="size-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              发送支付
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Payment info */}
          <div className="p-3 rounded-lg bg-[var(--surface-blue)] space-y-2">
            <InfoRow label="收款地址" value={invoice.paymentAddress?.slice(0, 20) + "..."} />
            <InfoRow
              label="金额"
              value={`${invoice.paymentAmount || "—"} ${invoice.paymentCurrency || ""}`}
            />
            <InfoRow label="网络" value={account.chain} />
            <InfoRow label="发送账户" value={account.address.slice(0, 16) + "..."} />
          </div>

          {/* Password */}
          {!result?.success && (
            <div>
              <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">
                钱包密码
              </label>
              <Input
                type="password"
                placeholder="输入密码以签署交易"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                result.success
                  ? "bg-[var(--success-surface)]"
                  : "bg-[var(--destructive-surface)]"
              }`}
            >
              {result.success ? (
                <CheckCircle className="size-4 text-[var(--success)] mt-0.5 shrink-0" />
              ) : (
                <XCircle className="size-4 text-[var(--destructive)] mt-0.5 shrink-0" />
              )}
              <div>
                <p
                  className={`text-xs font-semibold ${
                    result.success
                      ? "text-[var(--success-text)]"
                      : "text-[var(--destructive)]"
                  }`}
                >
                  {result.success ? "交易已签名" : "签名失败"}
                </p>
                {result.txHash && (
                  <code className="text-2xs text-[var(--foreground)] break-all mt-0.5 block">
                    {result.txHash}
                  </code>
                )}
                {result.error && (
                  <p className="text-2xs text-[var(--destructive)] mt-0.5">
                    {result.error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end gap-2">
          {result?.success ? (
            <Button variant="outline" onClick={onClose}>
              <CheckCircle className="size-4" />
              完成
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={sending}>
                取消
              </Button>
              <Button onClick={handleSend} loading={sending}>
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                确认发送
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-2xs text-[var(--muted-foreground)]">{label}</span>
      <span className="text-xs font-mono font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}
