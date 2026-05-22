"use client";

import React from "react";
import { cn } from "../lib/cn";

export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function NavItem({ className, active, destructive, icon, badge, children, ...props }: NavItemProps) {
  return (
    <button
      data-slot="nav-item"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg h-11 px-3 text-sm font-medium transition-all duration-[var(--duration-fast)]",
        active && "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-nav-active)]",
        !active && !destructive && "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]",
        destructive && "text-[var(--destructive)] hover:bg-[var(--destructive)]/8",
        className
      )}
      {...props}
    >
      {icon && <span className="size-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 text-left truncate">{children}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
}
