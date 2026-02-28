import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClientOnly } from "@/components/client-only";
import { getSubscriptionStatus } from "@/lib/subscription";
import { SubscriptionProvider } from "@/lib/subscription-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscriptionInfo = await getSubscriptionStatus(supabase, user.id);

  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-screen">
          <aside className="w-14 border-r bg-muted/20" />
          <div className="flex-1">
            <header className="h-16 border-b" />
            <main className="p-6 md:p-8 lg:p-10" />
          </div>
        </div>
      }
    >
      <SubscriptionProvider
        status={subscriptionInfo.status}
        trialDaysRemaining={subscriptionInfo.trialDaysRemaining}
        isActive={subscriptionInfo.isActive}
      >
        <DashboardShell>{children}</DashboardShell>
      </SubscriptionProvider>
    </ClientOnly>
  );
}
