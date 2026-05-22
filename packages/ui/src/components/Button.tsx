"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-[var(--duration-fast)] focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-cta-sm)] hover:brightness-110 active:brightness-90",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-95",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)]/6",
        ghost:
          "text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/6",
        foreground:
          "bg-[var(--foreground)] text-[var(--background)] hover:brightness-90",
        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-110",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        hero: "h-14 px-8 text-base font-semibold",
        lg: "h-12 px-6 text-sm font-semibold",
        default: "h-10 px-5 text-sm font-medium",
        sm: "h-8 px-4 text-xs font-medium",
        xs: "px-3 py-2 text-xs font-medium",
        icon: "size-9 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
