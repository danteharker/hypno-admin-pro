"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Mic,
  Users,
  Presentation,
  Settings,
  LayoutDashboard,
  Library,
  ListChecks,
  Wrench,
  Rss,
  Sparkles,
  MessageCircle,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
};

const overview: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, iconClass: "text-primary" },
];

const contentStudio: NavItem[] = [
  { label: "Scripts", href: "/dashboard/scripts", icon: FileText, iconClass: "text-primary" },
  { label: "Script Library", href: "/dashboard/script-library", icon: Library, iconClass: "text-accent-teal" },
  { label: "Suggestions", href: "/dashboard/suggestions", icon: ListChecks, iconClass: "text-primary" },
  { label: "Affirmations", href: "/dashboard/affirmations", icon: Sparkles, iconClass: "text-primary" },
  { label: "Tool Generator", href: "/dashboard/tool-generator", icon: Wrench, iconClass: "text-accent-rose" },
];

const audioMedia: NavItem[] = [
  { label: "Audio", href: "/dashboard/audio", icon: Mic, iconClass: "text-accent-teal" },
  { label: "Audio Mixer", href: "/dashboard/audio/new", icon: SlidersHorizontal, iconClass: "text-accent-teal" },
];

const clientPractice: NavItem[] = [
  { label: "Clients", href: "/dashboard/clients", icon: Users, iconClass: "text-accent-amber" },
  { label: "Session", href: "/dashboard/session", icon: Presentation, iconClass: "text-accent-amber" },
  { label: "Reflection Room", href: "/dashboard/reflection-room", icon: MessageCircle, iconClass: "text-accent-rose" },
];

const marketing: NavItem[] = [
  { label: "Random Post Engine", href: "/dashboard/random-post-engine", icon: Rss, iconClass: "text-accent-teal" },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-1.5 px-2">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map(({ label, href, icon: Icon, iconClass }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={false}
                  tooltip={label}
                  className="h-10 rounded-lg px-3 transition-smooth relative overflow-hidden hover:bg-sidebar-accent"
                >
                  <Link href={href} className={isActive ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-muted-foreground hover:text-foreground"}>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-gradient-to-b from-primary to-primary/60"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        aria-hidden
                      />
                    )}
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? iconClass ?? "text-primary" : iconClass ?? ""}`} />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setUserName(profile?.full_name?.trim() || user.user_metadata?.full_name || user.user_metadata?.name || null);
      }
    };
    loadUser();
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border/40 py-4 px-4 bg-gradient-to-r from-primary/5 to-transparent">
          <SidebarMenuButton asChild className="h-auto w-auto hover:bg-transparent p-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight text-gradient">
                Hypno Admin Pro
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4 flex flex-col gap-6">
          <NavSection title="Overview" items={overview} />
          <NavSection title="Content Studio" items={contentStudio} />
          <NavSection title="Audio & Media" items={audioMedia} />
          <NavSection title="Client Practice" items={clientPractice} />
          <NavSection title="Marketing" items={marketing} />
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/40 mt-auto py-3 px-2">
          {(userName || userEmail) && (
            <div className="px-2 pb-2 flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/15 text-primary">
                  {userName ? userName.slice(0, 2).toUpperCase() : userEmail?.slice(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName || "Account"}</p>
                {userEmail && (
                  <p className="text-xs text-muted-foreground truncate" title={userEmail}>{userEmail}</p>
                )}
              </div>
            </div>
          )}
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" className="h-10 rounded-lg px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-smooth">
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5 shrink-0" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                className="h-10 w-full rounded-lg px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/40 px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <SidebarTrigger className="-ml-2 hover:bg-muted rounded-md transition-smooth" />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-5 w-px bg-border/60 mx-1" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
