"use client";

import React from "react";
import { cn } from "../lib/cn";

const sizeMap = {
  xs: "size-7",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: keyof typeof sizeMap;
  fallback?: React.ReactNode;
  bgColor?: string;
}

export function Avatar({ className, src, alt, size = "md", fallback, bgColor, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  if (src && !error) {
    return (
      <div
        data-slot="avatar"
        className={cn("relative shrink-0 overflow-hidden rounded-full", sizeMap[size], className)}
        {...props}
      >
        <img
          src={src}
          alt={alt ?? ""}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        sizeMap[size],
        className
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      {...props}
    >
      {fallback ?? alt?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}
