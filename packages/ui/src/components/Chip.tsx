"use client";

import React from "react";
import { cn } from "../lib/cn";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: "sm" | "md";
}

export function Chip({ className, selected, size = "md", children, ...props }: ChipProps) {
  return (
    <button
      data-slot="chip"
      data-selected={selected}
      className={cn(
        "inline-flex items-center rounded-full border font-medium text-[13px] transition-all duration-[var(--duration-fast)] cursor-pointer",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
