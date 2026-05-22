import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const iconBoxVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
      "primary-soft": "bg-[var(--surface-blue-dim)] text-[var(--primary)]",
      success: "bg-[var(--success)] text-[var(--success-foreground)]",
      neutral: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      foreground: "bg-[var(--foreground)] text-[var(--background)]",
    },
    size: {
      xs: "size-8 rounded-[10px] [&>svg]:size-4",
      sm: "size-10 rounded-[12px] [&>svg]:size-5",
      md: "size-16 rounded-[20px] [&>svg]:size-8",
      lg: "size-[88px] rounded-[28px] [&>svg]:size-11",
      xl: "size-24 rounded-[28px] [&>svg]:size-12",
      "2xl": "size-[122px] rounded-[34px] [&>svg]:size-16",
    },
  },
  defaultVariants: {
    variant: "primary-soft",
    size: "md",
  },
});

export interface IconBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {
  children: React.ReactNode;
}

export function IconBox({ className, variant, size, children, ...props }: IconBoxProps) {
  return (
    <div data-slot="icon-box" className={cn(iconBoxVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}
