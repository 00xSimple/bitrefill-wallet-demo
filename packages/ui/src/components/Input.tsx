import React from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            data-slot="input"
            className={cn(
              "h-12 w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all duration-[var(--duration-fast)]",
              "focus:border-[var(--ring)] focus:outline-none focus:ring-3 focus:ring-[var(--ring)]/50",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]/50",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
