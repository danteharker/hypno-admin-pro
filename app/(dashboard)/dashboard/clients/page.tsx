"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, MoreHorizontal, User, Calendar, Activity, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";

type ClientRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  presenting_issues: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

function formatLastSession(
  sessionCount: number,
  lastSessionDate: string | null
): string {
  if (sessionCount === 0) return "Never";
  if (!lastSessionDate) return "—";
  const d = new Date(lastSessionDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
  return `${Math.floor(diffDays / 30)} month(s) ago`;
}

function statusFromClient(c: ClientRow, sessionCount: number): string {
  if (c.archived) return "Archived";
  if (sessionCount === 0) return "New";
  return "Active";
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [sessionCountByClient, setSessionCountByClient] = useState<Record<string, number>>({});
  const [lastSessionByClient, setLastSessionByClient] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in.");
        setLoading(false);
        return;
      }
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, full_name, email, phone, notes, presenting_issues, archived, created_at, updated_at")
        .eq("user_id", user.id)
        .order("full_name");
      if (clientsError) {
        setError(clientsError.message);
        setLoading(false);
        return;
      }
      setClients(clientsData ?? []);

      const ids = (clientsData ?? []).map((c) => c.id);
      if (ids.length === 0) {
        setSessionCountByClient({});
        setLastSessionByClient({});
        setLoading(false);
        return;
      }

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("client_id, session_date")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });
      const countByClient: Record<string, number> = {};
      const lastByClient: Record<string, string | null> = {};
      ids.forEach((id) => {
        countByClient[id] = 0;
        lastByClient[id] = null;
      });
      (sessionsData ?? []).forEach((s) => {
        countByClient[s.client_id] = (countByClient[s.client_id] ?? 0) + 1;
        if (!lastByClient[s.client_id]) lastByClient[s.client_id] = s.session_date;
      });
      setSessionCountByClient(countByClient);
      setLastSessionByClient(lastByClient);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter(
    (c) =>
      !search.trim() ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );
  const totalCount = clients.length;
  const activeThisWeek = 0; // placeholder until we filter sessions by week
  const sharedAudioCount = 0; // placeholder

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full pb-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-12">
      <PageHero
        icon={User}
        title="Clients"
        description="Manage your client profiles, track session history, and share resources securely."
        accentColor="amber"
      >
        <Link href="/dashboard/clients/new">
          <Button className="rounded-xl h-11 px-6 btn-shimmer gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </PageHero>

      <AnimatedSection delay={0.05}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary/[0.06] border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 hover-lift shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary icon-glow-emerald">
                <User className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">In your practice</p>
            </CardContent>
          </Card>
          <Card className="bg-accent-amber/[0.07] border-l-4 border-l-accent-amber border-t-0 border-r-0 border-b-0 hover-lift shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber/12 text-accent-amber icon-glow-amber">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeThisWeek}</div>
              <p className="text-xs text-muted-foreground">Sessions scheduled</p>
            </CardContent>
          </Card>
          <Card className="bg-accent-teal/[0.06] border-l-4 border-l-accent-teal border-t-0 border-r-0 border-b-0 hover-lift shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Audio</CardTitle>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-teal/12 text-accent-teal icon-glow-teal">
                <Mail className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharedAudioCount}</div>
              <p className="text-xs text-muted-foreground">Downloads this month</p>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search clients..."
              className="pl-10 h-10 w-full rounded-full bg-card/50 border-border/40 transition-all focus-visible:ring-1 focus-visible:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm overflow-hidden backdrop-blur-sm">
          <Table className="[&_tr]:border-border/40">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Client</TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Focus Areas</TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Last Session</TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="text-right py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Sessions</TableHead>
                <TableHead className="w-[50px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {clients.length === 0
                    ? "No clients yet. Add your first client to get started."
                    : "No clients match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => {
                const sessionCount = sessionCountByClient[client.id] ?? 0;
                const lastSession = lastSessionByClient[client.id] ?? null;
                const status = statusFromClient(client, sessionCount);
                const tags = client.presenting_issues
                  ? client.presenting_issues.split(/,\s*/).filter(Boolean)
                  : [];
                return (
                  <TableRow key={client.id} className="group transition-colors hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${client.full_name}`}
                            alt={client.full_name}
                          />
                          <AvatarFallback>
                            {client.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="hover:underline font-medium"
                          >
                            {client.full_name}
                          </Link>
                          {client.email && (
                            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3 mr-1" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="font-normal text-[10px] px-1.5 py-0"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                        {tags.length === 0 && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatLastSession(sessionCount, lastSession)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "Active"
                            ? "default"
                            : status === "New"
                              ? "secondary"
                              : "outline"
                        }
                        className="font-normal text-xs"
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        {sessionCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/session?client=${client.id}`}>
                              Start Session
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Share Audio Link</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" asChild>
                            <Link href={`/dashboard/clients/${client.id}/edit`}>
                              Delete
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </AnimatedSection>
    </div>
  );
}
