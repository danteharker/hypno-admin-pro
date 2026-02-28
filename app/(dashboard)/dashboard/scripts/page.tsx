"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Clock,
  Play,
  Star,
  Copy,
  Trash2,
  Loader2,
  Library,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

type ScriptRow = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_favourite: boolean;
  updated_at: string;
};

type LibraryScriptRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  relaxation: "Relaxation",
  anxiety: "Anxiety",
  sleep: "Sleep",
  confidence: "Confidence",
  habits: "Habit Control",
  weight: "Weight",
  phobias: "Phobias",
  custom: "Other",
};

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

function estDuration(content: string): string {
  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  const min = Math.max(5, Math.round(words / 100));
  return `${min} min`;
}

export default function ScriptsPage() {
  const router = useRouter();
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [libraryScripts, setLibraryScripts] = useState<LibraryScriptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editWithAI, setEditWithAI] = useState<LibraryScriptRow | null>(null);
  const [editInstructions, setEditInstructions] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("scripts")
        .select("id, title, content, category, is_favourite, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (!error) setScripts((data as ScriptRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from("library_scripts")
        .select("id, title, content, category, tags")
        .order("title");
      if (!error) setLibraryScripts((data as LibraryScriptRow[]) ?? []);
      setLibraryLoading(false);
    })();
  }, []);

  const filtered = scripts.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });
  const paginatedScripts = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paginatedScripts.length;

  const filteredLibrary = libraryScripts.filter((s) => {
    const q = librarySearch.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const useLibraryScript = async (lib: LibraryScriptRow) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newScript, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title: lib.title,
        content: lib.content,
        category: lib.category,
      })
      .select("id")
      .single();
    if (error) toast.error("Could not add script");
    else if (newScript) {
      toast.success("Script added to My Scripts");
      router.push(`/dashboard/scripts/${newScript.id}`);
    }
  };

  const submitEditWithAI = async () => {
    if (!editWithAI || !editInstructions.trim()) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch("/api/scripts/modify-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editWithAI.content,
          userInstructions: editInstructions.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Request failed");
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEditError("Session expired");
        return;
      }
      const { data: newScript, error } = await supabase
        .from("scripts")
        .insert({
          user_id: user.id,
          title: `Revised: ${editWithAI.title}`,
          content: data.content ?? editWithAI.content,
          category: editWithAI.category,
        })
        .select("id")
        .single();
      if (error) {
        setEditError(error.message);
        return;
      }
      setEditWithAI(null);
      setEditInstructions("");
      toast.success("Revised script created");
      router.push(`/dashboard/scripts/${newScript.id}`);
    } catch {
      setEditError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleFavourite = async (id: string) => {
    const s = scripts.find((x) => x.id === id);
    if (!s) return;
    setTogglingFav(id);
    const supabase = createClient();
    await supabase
      .from("scripts")
      .update({ is_favourite: !s.is_favourite })
      .eq("id", id);
    setScripts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, is_favourite: !x.is_favourite } : x))
    );
    setTogglingFav(null);
  };

  const duplicateScript = async (s: ScriptRow) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newScript, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title: `${s.title} (Copy)`,
        content: s.content,
        category: s.category,
      })
      .select("id")
      .single();
    if (error) toast.error("Could not duplicate script");
    else if (newScript) {
      toast.success("Script duplicated");
      router.push(`/dashboard/scripts/${newScript.id}`);
    }
  };

  const deleteScript = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("scripts").delete().eq("id", id);
    if (error) toast.error("Could not delete script");
    else {
      toast.success("Script deleted");
      setScripts((prev) => prev.filter((x) => x.id !== id));
    }
    setDeletingId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <PageHero
        icon={FileText}
        title="Scripts"
        description="Manage your library of hypnotherapy scripts. Create new ones with AI or from scratch."
        accentColor="emerald"
      >
        <Link href="/dashboard/scripts/new">
          <Button className="rounded-xl h-11 px-6 btn-shimmer gap-2">
            <Plus className="h-4 w-4" />
            New Script
          </Button>
        </Link>
      </PageHero>

      <Tabs defaultValue="mine" className="w-full">
        <AnimatedSection delay={0.05}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="mine" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Scripts
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Library
          </TabsTrigger>
        </TabsList>
        </AnimatedSection>

        <TabsContent value="mine" className="space-y-6 mt-0">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search scripts..."
                className="pl-10 h-10 w-full rounded-full bg-card/50 border-border/40 transition-all focus-visible:ring-1 focus-visible:bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card/50 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
          <p className="text-muted-foreground">
            {scripts.length === 0
              ? "No scripts yet. Create one with AI or start from a blank canvas."
              : "No scripts match your search."}
          </p>
          {scripts.length === 0 && (
            <Link href="/dashboard/scripts/new" className="mt-4 inline-block">
              <Button>New Script</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
        <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm overflow-x-auto backdrop-blur-sm accent-bar accent-bar-emerald">
          <Table className="[&_tr]:border-border/40 min-w-[600px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Title
                </TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Category
                </TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Duration
                </TableHead>
                <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Status
                </TableHead>
                <TableHead className="text-right py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Last Modified
                </TableHead>
                <TableHead className="w-[50px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {paginatedScripts.map((script) => (
                <TableRow
                  key={script.id}
                  className="group transition-colors hover:bg-muted/20"
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleFavourite(script.id)}
                        className="shrink-0 p-1 rounded hover:bg-muted/50"
                        aria-label={script.is_favourite ? "Remove from favourites" : "Add to favourites"}
                        title={script.is_favourite ? "Remove from favourites" : "Mark as favourite"}
                      >
                        {togglingFav === script.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Star
                            className={`h-4 w-4 ${script.is_favourite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          />
                        )}
                      </button>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Link
                        href={`/dashboard/scripts/${script.id}`}
                        className="hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                      >
                        {script.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className="font-normal text-[11px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground/80 border-border/40"
                    >
                      {script.category ? CATEGORY_LABELS[script.category] ?? script.category : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 opacity-70" />
                      {estDuration(script.content)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={script.is_favourite ? "default" : "outline"}
                      className="font-normal text-[11px] px-2 py-0.5 rounded-full border-border/40 text-muted-foreground"
                    >
                      {script.is_favourite ? "Favourite" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground py-4">
                    {formatRelativeTime(script.updated_at)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(script.id)}
                        disabled={deletingId === script.id}
                        aria-label="Delete script"
                      >
                        {deletingId === script.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted/50"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px] rounded-xl p-1 shadow-md border-border/40"
                      >
                        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-sm" asChild>
                          <Link href={`/dashboard/scripts/${script.id}`}>
                            <FileText className="mr-2 h-4 w-4 opacity-70" />
                            Edit script
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-sm" asChild>
                          <Link href={`/dashboard/session?scriptId=${script.id}`}>
                            <Play className="mr-2 h-4 w-4 opacity-70" />
                            Open in Session
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-lg cursor-pointer text-sm"
                          onClick={() => duplicateScript(script)}
                        >
                          <Copy className="mr-2 h-4 w-4 opacity-70" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40 my-1" />
                        <DropdownMenuItem
                          className="text-destructive rounded-lg cursor-pointer text-sm focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => setDeleteTarget(script.id)}
                          disabled={deletingId === script.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} className="rounded-xl">
              Load more ({filtered.length - paginatedScripts.length} remaining)
            </Button>
          </div>
        )}
        </>
      )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6 mt-0">
          <p className="text-sm text-muted-foreground">
            Pre-written scripts you can use as-is or send to AI to revise. &quot;Use script&quot; copies it to My Scripts; &quot;Edit with AI&quot; lets you describe changes and save the revised version.
          </p>
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                className="pl-10 h-10 w-full rounded-full bg-card/50 border-border/40"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
              />
            </div>
          </div>
          {libraryLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLibrary.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/50 p-12 text-center">
              <Library className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground">
                No library scripts available yet. Check back soon — we&apos;re adding new scripts regularly.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm overflow-hidden accent-bar accent-bar-emerald">
              <Table className="[&_tr]:border-border/40">
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px] py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Title</TableHead>
                    <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Category</TableHead>
                    <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Duration</TableHead>
                    <TableHead className="text-right py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {filteredLibrary.map((lib) => (
                    <TableRow key={lib.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                            <FileText className="h-4 w-4" />
                          </div>
                          {lib.title}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="font-normal text-[11px] px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[lib.category] ?? lib.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {estDuration(lib.content)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => useLibraryScript(lib)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Use script
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              setEditWithAI(lib);
                              setEditInstructions("");
                              setEditError(null);
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            Edit with AI
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete script"
        description="Are you sure you want to delete this script? This action cannot be undone."
        confirmLabel="Delete script"
        loading={!!deletingId}
        onConfirm={() => deleteTarget && deleteScript(deleteTarget)}
      />

      <Dialog open={!!editWithAI} onOpenChange={(open) => !open && setEditWithAI(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit with AI</DialogTitle>
            <DialogDescription>
              Describe how you want to change this script. AI will produce a revised version and save it to My Scripts.
            </DialogDescription>
          </DialogHeader>
          {editWithAI && (
            <>
              <p className="text-sm font-medium text-foreground">Script: {editWithAI.title}</p>
              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                <Label htmlFor="edit-instructions">What would you like to change?</Label>
                <Textarea
                  id="edit-instructions"
                  placeholder="E.g. Make it shorter, add more ocean imagery, tone down the awakening section..."
                  className="min-h-[100px] resize-none"
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                />
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditWithAI(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitEditWithAI}
              disabled={!editInstructions.trim() || editSubmitting}
            >
              {editSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate revised script
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
