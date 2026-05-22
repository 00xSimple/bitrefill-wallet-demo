"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { cn } from "../lib/cn";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "warning" | "error" | "info";
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const borderColors = {
  success: "border-[var(--success)]",
  warning: "border-[var(--warning)]",
  error: "border-[var(--destructive)]",
  info: "border-[var(--primary)]",
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const newItem: ToastItem = { ...item, id };
    setToasts((prev) => [...prev, newItem]);
    const duration = item.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.variant ?? "info"];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-[var(--card)] p-4 shadow-[var(--shadow-card)] animate-in slide-in-from-right",
                borderColors[t.variant ?? "info"]
              )}
            >
              <Icon className="size-5 shrink-0 mt-0.5 text-[var(--foreground)]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
