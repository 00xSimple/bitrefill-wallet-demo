"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button, Badge } from "@repo/ui";
import { Copy, Check, Clock, QrCode, AlertTriangle, Info } from "lucide-react";
import type { BitrefillInvoice } from "@/lib/bitrefill";
import { formatCrypto } from "@/lib/bitrefill";

interface PaymentPanelProps {
  invoice: BitrefillInvoice;
  onRefresh: () => void;
  loading?: boolean;
}

export function PaymentPanel({ invoice, onRefresh, loading }: PaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function calcTimeLeft(): number | null {
    if (!invoice.expiresAt) return null;
    const diff = new Date(invoice.expiresAt).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  }

  // QR code generation
  useEffect(() => {
    let cancelled = false;
    const addr = invoice.paymentAddress;
    if (!addr) return;

    import("qrcode").then((QRCode) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      QRCode.toCanvas(canvas, addr, {
        width: 200,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [invoice.paymentAddress]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [invoice.expiresAt]);

  const handleCopy = async () => {
    if (!invoice.paymentAddress) return;
    await navigator.clipboard.writeText(invoice.paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft !== null && timeLeft <= 0;
  const hasAddress = !!invoice.paymentAddress;

  return (
    <div className="p-5 rounded-2xl border border-[var(--info-border)] bg-[var(--info-surface)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-[var(--info)]" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            支付详情
          </h3>
        </div>
        {isExpired ? (
          <Badge variant="destructive" size="md">已过期</Badge>
        ) : timeLeft !== null ? (
          <Badge variant="neutral" size="md">
            <Clock className="size-3.5" />
            <span className="ml-1">{formatTime(timeLeft)}</span>
          </Badge>
        ) : null}
      </div>

      {isExpired && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--destructive-surface)]">
          <AlertTriangle className="size-4 text-[var(--destructive)]" />
          <p className="text-xs text-[var(--destructive)]">
            该订单已过期，请创建新订单
          </p>
        </div>
      )}

      {/* Amount & Currency */}
      {invoice.paymentAmount && (
        <div className="text-center">
          <p className="text-2xs text-[var(--muted-foreground)]">支付金额</p>
          <p className="text-display-sm font-bold text-[var(--foreground)]">
            {invoice.paymentAmount} {invoice.paymentCurrency || ""}
          </p>
          <p className="text-2xs text-[var(--muted-foreground)] mt-0.5">
            等值 {invoice.amount} {invoice.currency}
          </p>
        </div>
      )}

      {/* QR Code */}
      {hasAddress && (
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-xl">
            <canvas ref={canvasRef} className="size-[200px]" />
          </div>
        </div>
      )}

      {/* Payment Address */}
      {hasAddress && (
        <div>
          <p className="text-2xs text-[var(--muted-foreground)] mb-1.5">
            收款地址
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--surface-page)] border border-[var(--border)]">
            <code className="text-xs font-mono text-[var(--foreground)] flex-1 break-all leading-relaxed">
              {invoice.paymentAddress}
            </code>
            <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
              {copied ? (
                <Check className="size-4 text-[var(--success)]" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onRefresh}
          loading={loading}
        >
          刷新状态
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!hasAddress}
        >
          {copied ? "已复制" : "复制地址"}
        </Button>
      </div>

      {/* Tips */}
      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-2xs text-[var(--muted-foreground)] leading-relaxed">
          请向上述地址发送精确金额。支付将在区块链确认后自动检测，通常需要 1-5 分钟。
        </p>
      </div>
    </div>
  );
}
