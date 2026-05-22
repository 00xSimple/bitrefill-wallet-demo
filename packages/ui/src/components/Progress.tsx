import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const progressVariants = cva("w-full rounded-full overflow-hidden", {
  variants: {
    variant: {
      primary: "bg-[var(--progress-track)]",
      success: "bg-[var(--progress-track)]",
    },
    size: {
      sm: "h-1.5",
      md: "h-2",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const barVariants = cva("h-full rounded-full transition-all duration-[420ms] var(--ease-emphasis)", {
  variants: {
    variant: {
      primary: "bg-[var(--primary)]",
      success: "bg-[var(--success)]",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
}

export function Progress({ className, variant, size, value, max = 100, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(progressVariants({ variant, size }), className)}
      {...props}
    >
      <div
        className={cn(barVariants({ variant }))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
