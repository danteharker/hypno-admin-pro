import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClientOnly } from "@/components/client-only";

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
      <DashboardShell>{children}</DashboardShell>
    </ClientOnly>
  );
}
