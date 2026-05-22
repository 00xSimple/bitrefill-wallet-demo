"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Package } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-page)] md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[var(--foreground)]"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex size-7 items-center justify-center rounded-full bg-[var(--primary)]">
            <Package className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Bitrefill Wallet
          </span>
        </div>

        <div className="px-4 md:px-6 py-6 md:py-8 mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
