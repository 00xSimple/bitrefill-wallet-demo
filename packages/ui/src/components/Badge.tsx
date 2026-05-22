import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-[var(--surface-blue-light)] text-[var(--primary)]",
        success: "bg-[var(--success-surface)] text-[var(--success-text)]",
        neutral: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        positive: "bg-[var(--positive-surface)] text-[var(--positive)]",
        destructive: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}
