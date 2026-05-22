import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const sectionVariants = cva("rounded-xl border border-[var(--border)] bg-[var(--card)]", {
  variants: {
    variant: {
      default: "shadow-[var(--shadow-card)]",
      elevated: "shadow-[var(--shadow-card-md)]",
      flat: "",
    },
    padding: {
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
      xl: "p-6 sm:p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface SectionPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {}

export function SectionPanel({ className, variant, padding, ...props }: SectionPanelProps) {
  return (
    <div data-slot="section-panel" className={cn(sectionVariants({ variant, padding }), className)} {...props} />
  );
}
