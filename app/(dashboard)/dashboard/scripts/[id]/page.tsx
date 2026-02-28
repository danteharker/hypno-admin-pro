"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Save, Play, Download, Trash2, Copy, Clock, Tags, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "relaxation", label: "Deep Relaxation" },
  { value: "anxiety", label: "Anxiety & Stress" },
  { value: "sleep", label: "Sleep Induction" },
  { value: "confidence", label: "Confidence" },
  { value: "habits", label: "Habit Control" },
  { value: "weight", label: "Weight Management" },
  { value: "phobias", label: "Fears & Phobias" },
  { value: "custom", label: "Other / Custom" },
];

type ScriptRow = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  is_favourite: boolean;
  updated_at: string;
};

export default function ScriptEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const printRef = useRef<HTMLDivElement>(null);

  const [script, setScript] = useState<ScriptRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("relaxation");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "unsaved">("idle");
  const lastSavedRef = useRef({ title: "", content: "", category: "", tags: "" });
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty =
    script &&
    (title !== lastSavedRef.current.title ||
      content !== lastSavedRef.current.content ||
      category !== lastSavedRef.current.category ||
      tags.join(",") !== lastSavedRef.current.tags);

  const handleSave = useCallback(async () => {
    if (!id || !script) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveStatus("saving");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      setSaveStatus("unsaved");
      return;
    }
    const { error } = await supabase
      .from("scripts")
      .update({
        title,
        content,
        category: category || null,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      setSaveError(error.message);
      setSaveStatus("unsaved");
      toast.error("Could not save script");
    } else {
      lastSavedRef.current = { title, content, category, tags: tags.join(",") };
      setSaveStatus("saved");
      toast.success("Script saved");
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    }
    setIsSaving(false);
  }, [id, script, title, content, category, tags]);

  useEffect(() => {
    if (!script || !isDirty) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setSaveStatus("unsaved");
    autosaveTimerRef.current = setTimeout(() => {
      handleSave();
      autosaveTimerRef.current = null;
    }, 3000);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, content, category, tags, isDirty, script, handleSave]);


  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (script && !isSaving) handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [script, isSaving, handleSave]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase
        .from("scripts")
        .select("id, title, content, category, tags, is_favourite, updated_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setScript(data as ScriptRow);
      setTitle(data.title ?? "");
      setContent(data.content ?? "");
      setCategory(data.category ?? "relaxation");
      const tagsArr = Array.isArray(data.tags) ? data.tags : [];
      setTags(tagsArr);
      lastSavedRef.current = {
        title: data.title ?? "",
        content: data.content ?? "",
        category: data.category ?? "relaxation",
        tags: tagsArr.join(","),
      };
      setLoading(false);
    })();
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("scripts").delete().eq("id", id).eq("user_id", user.id);
    if (error) toast.error("Could not delete script");
    else toast.success("Script deleted");
    router.push("/dashboard/scripts");
  };

  const handleDuplicate = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: newScript, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title: `${title} (Copy)`,
        content,
        category: category || null,
        tags,
      })
      .select("id")
      .single();
    if (!error && newScript) {
      toast.success("Script duplicated");
      router.push(`/dashboard/scripts/${newScript.id}`);
    } else toast.error("Could not duplicate script");
  };

  const handleExportPdf = () => {
    window.print();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
  const estMin = Math.max(5, Math.round(wordCount / 100));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-12">
        <p className="text-muted-foreground">Script not found or you don’t have access to it.</p>
        <Link href="/dashboard/scripts">
          <Button variant="outline">Back to Scripts</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="no-print flex flex-col h-[calc(100vh-theme(spacing.14)-theme(spacing.8))] w-full max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Link
              href="/dashboard/scripts"
              onClick={(e) => {
                if (isDirty) {
                  e.preventDefault();
                  setPendingNav("/dashboard/scripts");
                  setLeaveConfirmOpen(true);
                }
              }}
            >
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none bg-transparent shadow-none hover:bg-muted/50 focus-visible:bg-background focus-visible:ring-1 max-w-xl h-auto py-1 font-serif"
            />
            <Badge variant="secondary" className="ml-2 font-normal hidden sm:inline-flex">
              {script?.is_favourite ? "Favourite" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href={`/dashboard/session?scriptId=${id}`}>
              <Button variant="secondary" size="sm" className="hidden sm:flex">
                <Play className="h-4 w-4 mr-2" />
                Session Mode
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "unsaved" && "Unsaved changes"}
            </span>
            <Button size="sm" onClick={() => handleSave()} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Script"}
            </Button>
          </div>
        </div>

        {saveError && (
          <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{saveError}</p>
        )}

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="flex-1 flex flex-col bg-card border rounded-lg overflow-hidden shadow-sm border-border/40">
            <div className="border-b bg-muted/20 px-4 py-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Est. {estMin} min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none border-0 focus-visible:ring-0 p-6 md:p-8 text-base md:text-lg leading-relaxed bg-transparent rounded-none"
              placeholder="Start typing your script here..."
            />
          </div>

          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pb-4">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tags</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add tag..."
                      className="h-8 text-sm"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button variant="secondary" size="icon" className="h-8 w-8 shrink-0" onClick={addTag}>
                      <Tags className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-xs font-normal cursor-pointer"
                        onClick={() => removeTag(t)}
                      >
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 border-border/40 mt-auto">
              <CardContent className="pt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Script
                </Button>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Script
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete script"
        description="Are you sure you want to delete this script? This action cannot be undone."
        confirmLabel="Delete script"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={leaveConfirmOpen}
        onOpenChange={(open) => {
          setLeaveConfirmOpen(open);
          if (!open) setPendingNav(null);
        }}
        title="Unsaved changes"
        description="You have unsaved changes. Leave anyway? Your changes will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="destructive"
        onConfirm={() => {
          if (pendingNav) router.push(pendingNav);
          setLeaveConfirmOpen(false);
          setPendingNav(null);
        }}
      />

      {/* Print-only view for Export / Save as PDF */}
      <div
        ref={printRef}
        className="print-only hidden p-8 max-w-4xl mx-auto"
        aria-hidden
      >
        <h1 className="text-2xl font-serif font-semibold mb-6">{title}</h1>
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
          {content || "(No content)"}
        </pre>
      </div>
    </>
  );
}
