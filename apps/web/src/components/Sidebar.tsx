"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem, Button, useTheme, Avatar, Badge } from "@repo/ui";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Wallet,
  Sun,
  Moon,
  LogOut,
  Package,
  X,
} from "lucide-react";
import { useWalletStore, useCartStore } from "@/lib/store";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { selectedAccount, reset } = useWalletStore();
  const cartCount = useCartStore((s) => s.items.length);

  const addr = selectedAccount?.address;

  const navItems = [
    { href: "/", label: "仪表盘", icon: LayoutDashboard },
    { href: "/products", label: "礼品卡商店", icon: ShoppingBag },
    { href: "/cart", label: "购物车", icon: ShoppingCart, badge: cartCount > 0 ? cartCount : 0 },
    { href: "/orders", label: "我的订单", icon: Receipt },
    { href: "/wallet", label: "钱包管理", icon: Wallet },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)]">
        <div className="flex size-8 items-center justify-center rounded-full bg-[var(--primary)]">
          <Package className="size-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">
            Bitrefill Wallet
          </p>
          <p className="text-2xs text-[var(--muted-foreground)] leading-tight">
            电商助手
          </p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden ml-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            active={pathname === item.href}
            icon={<item.icon className="size-4" />}
            badge={item.badge ? <Badge variant="primary" size="sm">{item.badge}</Badge> : undefined}
            onClick={() => {
              router.push(item.href);
              onMobileClose?.();
            }}
          >
            {item.label}
          </NavItem>
        ))}
      </nav>

      {/* Account info */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        {addr ? (
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              fallback={addr.slice(0, 2)}
              bgColor="var(--surface-blue-dim)"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--foreground)] truncate">
                {addr.slice(0, 6)}...{addr.slice(-4)}
              </p>
              <p className="text-2xs text-[var(--muted-foreground)]">
                {selectedAccount?.chain ?? "ETH"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            未连接钱包
          </p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between px-3 py-3 border-t border-[var(--border)]">
        <Button variant="ghost" size="icon-sm" onClick={toggle}>
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        {addr && (
          <Button variant="ghost" size="icon-sm" onClick={reset}>
            <LogOut className="size-4 text-[var(--destructive)]" />
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-in fade-in-0"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-page)] transition-transform duration-300 var(--ease-emphasis) md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
