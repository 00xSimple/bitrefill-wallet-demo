"use client";

import { useEffect, useRef } from "react";
import { useWalletStore } from "@/lib/store";

export function WalletHydrator({ children }: { children: React.ReactNode }) {
  const hydrated = useWalletStore((s) => s.hydrated);
  const hydrateFromDB = useWalletStore((s) => s.hydrateFromDB);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    hydrateFromDB();
  }, []);

  return <>{children}</>;
}
