"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * Renders children only after mount. Use to avoid hydration mismatches
 * when child components (e.g. Radix UI) generate different IDs on server vs client.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
