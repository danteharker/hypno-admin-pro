"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Download, Settings, FileText, Music, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

type SessionRow = {
  id: string;
  session_date: string;
  session_type: string | null;
  notes: string | null;
  scripts_used: unknown;
};

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<ClientRow | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in.");
        setLoading(false);
        return;
      }
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, full_name, email, phone, notes, presenting_issues, archived, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (clientError || !clientData) {
        setError(clientError?.message ?? "Client not found.");
        setLoading(false);
        return;
      }
      setClient(clientData);

      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("id, session_date, session_type, notes, scripts_used")
        .eq("client_id", id)
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });
      setSessions(sessionsData ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 w-full">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-destructive">{error ?? "Client not found."}</p>
      </div>
    );
  }

  const tags = client.presenting_issues
    ? client.presenting_issues.split(/,\s*/).filter(Boolean)
    : [];
  const joinedDate = new Date(client.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const status = client.archived ? "Archived" : sessions.length === 0 ? "New" : "Active";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {client.email && <span>{client.email}</span>}
              {client.email && <span>•</span>}
              <span>Joined {joinedDate}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${client.id}/edit`}>
                <Settings className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/session?client=${client.id}`}>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://avatar.vercel.sh/${client.full_name}`} />
                <AvatarFallback>
                  {client.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Status</span>
                <Badge variant={client.archived ? "outline" : "default"}>{status}</Badge>
              </div>
              {client.phone && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Phone</span>
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Focus Areas</span>
                <div className="flex flex-wrap gap-1">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {tag.trim()}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Total Sessions</span>
                <div className="flex items-center font-medium">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="history">
            <CardHeader className="pb-0 border-b">
              <TabsList className="w-full justify-start rounded-none border-b-0 h-10 p-0 bg-transparent gap-4">
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  Session History
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  Private Notes
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  Shared Audio
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-6">
              <TabsContent value="history" className="m-0 space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sessions yet. Start a session to log activity here.
                  </p>
                ) : (
                  sessions.map((session) => {
                    const dateStr = new Date(session.session_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    );
                    const scriptsUsed = Array.isArray(session.scripts_used)
                      ? session.scripts_used
                      : [];
                    const scriptLabel =
                      scriptsUsed.length > 0
                        ? (scriptsUsed[0] as { title?: string }).title ?? "Script used"
                        : "N/A";
                    return (
                      <div
                        key={session.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card/50"
                      >
                        <div className="w-32 flex-shrink-0">
                          <div className="text-sm font-medium">{dateStr}</div>
                          <Badge
                            variant="outline"
                            className="mt-1 font-normal text-[10px]"
                          >
                            {session.session_type ?? "Session"}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">Script:</span>
                            <span className="text-muted-foreground">{scriptLabel}</span>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground">{session.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>
              <TabsContent value="notes" className="m-0 text-sm text-muted-foreground">
                {client.notes ? (
                  <p className="whitespace-pre-wrap">{client.notes}</p>
                ) : (
                  <p>No private notes yet. Add notes when editing this client.</p>
                )}
              </TabsContent>
              <TabsContent value="audio" className="m-0 text-sm text-muted-foreground">
                Manage audio files specifically shared with this client via secure links. (Coming
                later.)
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
