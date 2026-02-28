"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { SubscriptionStatus } from "./subscription";

type SubscriptionContextValue = {
  status: SubscriptionStatus;
  trialDaysRemaining: number | null;
  isActive: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  status,
  trialDaysRemaining,
  isActive,
  children,
}: SubscriptionContextValue & { children: ReactNode }) {
  return (
    <SubscriptionContext.Provider
      value={{ status, trialDaysRemaining, isActive }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    return {
      status: "incomplete",
      trialDaysRemaining: null,
      isActive: false,
    };
  }
  return ctx;
}
