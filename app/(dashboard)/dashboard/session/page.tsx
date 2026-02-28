"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  Square,
  Clock,
  SkipForward,
  SkipBack,
  Maximize,
  Minus,
  Plus,
  Loader2,
  ArrowLeft,
  FileText,
  Presentation,
  HelpCircle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";

type ClientRow = { id: string; full_name: string };
type ScriptRow = { id: string; title: string; content: string };

/** Split text into sentences (rough: . ! ? then space or end). */
function splitSentences(block: string): string[] {
  return block
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Chunk into 2–3 sentences per block for easy reading (matches SCRIPT-FORMATTING-RULES). */
function parseScriptContent(content: string): { type: "text"; text: string }[] {
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const result: { type: "text"; text: string }[] = [];
  for (const para of paragraphs) {
    const sentences = splitSentences(para);
    if (sentences.length <= 3) {
      result.push({ type: "text", text: para });
      continue;
    }
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 3).join(" ");
      if (chunk) result.push({ type: "text", text: chunk });
    }
  }
  return result;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const SCROLL_BASE_PX_PER_SEC = 35;
const SCROLL_TICK_MS = 80;

/** Get pause duration in seconds from block text, e.g. "(Pause 3s)" or "(Pause 5s)". Returns max if multiple. */
function getPauseSeconds(text: string): number {
  const matches = text.matchAll(/\(Pause\s*(\d+)\s*s\)/gi);
  let max = 0;
  for (const m of matches) {
    const n = parseInt(m[1], 10);
    if (n > max) max = n;
  }
  return max;
}

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client");
  const scriptIdParam = searchParams.get("scriptId");

  const [client, setClient] = useState<ClientRow | null>(null);
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(scriptIdParam);
  const [selectedScript, setSelectedScript] = useState<ScriptRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pausedForBlocksRef = useRef<Set<number>>(new Set());
  const [cuePauseSecondsLeft, setCuePauseSecondsLeft] = useState(0);

  const [endSessionOpen, setEndSessionOpen] = useState(false);
  const [sessionType, setSessionType] = useState("Hypnosis");
  const [sessionNotes, setSessionNotes] = useState("");
  const [savingSession, setSavingSession] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const sessionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in.");
        setLoading(false);
        return;
      }
      if (clientId) {
        const { data: clientData, error: clientErr } = await supabase
          .from("clients")
          .select("id, full_name")
          .eq("id", clientId)
          .eq("user_id", user.id)
          .single();
        if (clientErr || !clientData) {
          setError(clientErr?.message ?? "Client not found.");
          setLoading(false);
          return;
        }
        setClient(clientData);
      }

      const { data: scriptsData } = await supabase
        .from("scripts")
        .select("id, title, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setScripts((scriptsData as ScriptRow[]) ?? []);
      setLoading(false);
    })();
  }, [clientId]);

  useEffect(() => {
    setSelectedScript(
      selectedScriptId ? scripts.find((s) => s.id === selectedScriptId) ?? null : null
    );
  }, [selectedScriptId, scripts]);

  const scriptContent = useMemo(() => {
    if (!selectedScript?.content) return [];
    return parseScriptContent(selectedScript.content);
  }, [selectedScript?.content]);

  // Reset timer when starting session or changing script
  useEffect(() => {
    if (sessionStarted) setElapsedSeconds(0);
  }, [sessionStarted, selectedScriptId]);

  // Reset scroll state when script content changes
  useEffect(() => {
    paragraphRefs.current = [];
    pausedForBlocksRef.current = new Set();
    setCurrentIndex(0);
    setCuePauseSecondsLeft(0);
  }, [scriptContent.length]);

  // When we land on a block with (Pause Ns), pause scroll and timer for N seconds
  useEffect(() => {
    if (scriptContent.length === 0 || cuePauseSecondsLeft > 0) return;
    const block = scriptContent[currentIndex];
    if (!block) return;
    const pauseSec = getPauseSeconds(block.text);
    if (pauseSec === 0) return;
    if (!pausedForBlocksRef.current.has(currentIndex) && isPlaying) {
      pausedForBlocksRef.current.add(currentIndex);
      setIsPlaying(false);
      setCuePauseSecondsLeft(pauseSec);
    }
  }, [currentIndex, scriptContent, isPlaying, cuePauseSecondsLeft]);

  // Count down cue pause; when it hits 0, resume
  useEffect(() => {
    if (cuePauseSecondsLeft <= 0) return;
    const t = setInterval(() => {
      setCuePauseSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cuePauseSecondsLeft]);

  // Timer tick when playing (and not in a cue pause)
  useEffect(() => {
    if (!isPlaying || cuePauseSecondsLeft > 0) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, cuePauseSecondsLeft]);

  // Auto-scroll when playing (and not in a cue pause)
  useEffect(() => {
    if (!isPlaying || cuePauseSecondsLeft > 0 || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const scrollInterval = setInterval(() => {
      const delta = (SCROLL_BASE_PX_PER_SEC * scrollSpeed * SCROLL_TICK_MS) / 1000;
      el.scrollTop += delta;
    }, SCROLL_TICK_MS);
    return () => clearInterval(scrollInterval);
  }, [isPlaying, cuePauseSecondsLeft, scrollSpeed]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || scriptContent.length === 0) return;
    const center = el.scrollTop + el.clientHeight / 2;
    const refs = paragraphRefs.current;
    for (let i = 0; i < refs.length; i++) {
      const node = refs[i];
      if (!node) continue;
      const top = node.offsetTop;
      const bottom = top + node.offsetHeight;
      if (center >= top && center < bottom) {
        setCurrentIndex(i);
        return;
      }
    }
    if (refs.length > 0 && center >= (refs[refs.length - 1]?.offsetTop ?? 0)) {
      setCurrentIndex(scriptContent.length - 1);
    }
  }, [scriptContent.length]);

  const handleSkipForward = useCallback(() => {
    const next = Math.min(currentIndex + 1, scriptContent.length - 1);
    if (next === currentIndex) return;
    const node = paragraphRefs.current[next];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentIndex(next);
    }
  }, [currentIndex, scriptContent.length]);

  const handleSkipBack = useCallback(() => {
    const prev = Math.max(0, currentIndex - 1);
    if (prev === currentIndex) return;
    const node = paragraphRefs.current[prev];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentIndex(prev);
    }
  }, [currentIndex, scriptContent.length]);

  const handleFullscreen = useCallback(() => {
    const el = sessionContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const target = sessionContainerRef.current;
    if (!target) return;
    const handler = () => {
      if (document.fullscreenElement === target) {
        target.classList.add("fullscreen");
      } else {
        target.classList.remove("fullscreen");
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "?") {
        setShowKeyboardHelp((v) => !v);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleSkipForward();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handleSkipBack();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setFontSize((f) => Math.min(48, f + 2));
        return;
      }
      if (e.key === "-") {
        e.preventDefault();
        setFontSize((f) => Math.max(16, f - 2));
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSkipForward, handleSkipBack]);

  const handleEndSession = async () => {
    if (!selectedScript) return;
    if (client && clientId) {
      setSavingSession(true);
      setSaveError(null);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaveError("Please sign in.");
        setSavingSession(false);
        return;
      }
      const { error: insertErr } = await supabase.from("sessions").insert({
        client_id: clientId,
        user_id: user.id,
        session_date: new Date().toISOString().slice(0, 10),
        session_type: sessionType || "Hypnosis",
        notes: sessionNotes.trim() || null,
        scripts_used: [{ id: selectedScript.id, title: selectedScript.title }],
      });
      if (insertErr) {
        setSaveError(insertErr.message);
        setSavingSession(false);
        return;
      }
      setEndSessionOpen(false);
      router.push(`/dashboard/clients/${clientId}`);
    } else {
      setEndSessionOpen(false);
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-destructive">{error}</p>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <PageHero
          icon={Presentation}
          title="Start session"
          description={client ? `Client: ${client.full_name}. Choose a script to begin.` : "Choose a script to run the teleprompter. You can link a client from their profile if you want to log this session."}
          accentColor="indigo"
          backHref={clientId ? `/dashboard/clients/${clientId}` : "/dashboard"}
        />
        <AnimatedSection delay={0.05}>
          <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm overflow-hidden accent-bar accent-bar-teal bg-accent-teal/[0.06] border-accent-teal/20 p-5 space-y-4 gradient-border hover-lift">
            <div className="space-y-2">
              <Label className="text-base font-medium">Choose a script</Label>
              <Select
                value={selectedScriptId ?? ""}
                onValueChange={(v) => setSelectedScriptId(v || null)}
              >
                <SelectTrigger className="w-full rounded-xl h-11">
                  <SelectValue placeholder="Select script..." />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {s.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scripts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No scripts yet. <Link href="/dashboard/scripts/new" className="text-primary underline">Create one</Link> first.
                </p>
              )}
            </div>
            <Button
              size="lg"
              className="w-full rounded-xl btn-shimmer gap-2 h-12"
              disabled={!selectedScriptId}
              onClick={() => setSessionStarted(true)}
            >
              <Play className="h-4 w-4" />
              Begin session
            </Button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <>
      <div
        ref={sessionContainerRef}
        className={`flex flex-col h-[calc(100vh-theme(spacing.14)-theme(spacing.8))] w-full max-w-5xl mx-auto rounded-xl overflow-hidden border ${theme === "dark" ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-900"}`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-zinc-600/80 bg-zinc-700/70" : "border-zinc-200 bg-zinc-50"}`}
        >
          <div className="flex flex-col">
            <h1 className="font-semibold">{selectedScript?.title ?? "Session"}</h1>
            <p className={`text-sm ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
              {client ? `Client: ${client.full_name}` : "Practice session"}
              {scriptContent.length > 0 && (
                <span className="ml-2 font-mono text-xs">
                  · Block {currentIndex + 1} of {scriptContent.length}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xl font-medium text-primary">
                <Clock className="h-5 w-5" />
                {formatElapsed(elapsedSeconds)}
              </div>
              {cuePauseSecondsLeft > 0 && (
                <span className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
                  Pause {cuePauseSecondsLeft}s
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className={theme === "dark" ? "text-zinc-300 hover:text-white border-zinc-500" : "text-zinc-600 hover:text-zinc-900 border-zinc-300"}
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              Toggle Theme
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={theme === "dark" ? "text-zinc-300 hover:text-white border-zinc-500" : "text-zinc-600 hover:text-zinc-900 border-zinc-300"}
              onClick={() => setEndSessionOpen(true)}
            >
              {client ? "End session" : "Finish"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div
            className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b z-10 ${theme === "dark" ? "from-zinc-800 to-transparent" : "from-white to-transparent"}`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t z-10 ${theme === "dark" ? "from-zinc-800 to-transparent" : "from-white to-transparent"}`}
          />
          <div
            className={`absolute top-1/2 inset-x-0 h-[1px] -translate-y-1/2 z-0 ${theme === "dark" ? "bg-zinc-600" : "bg-zinc-200"}`}
          />
          <div
            className={`absolute top-1/2 left-4 h-2 w-2 rounded-full -translate-y-1/2 -translate-x-1/2 z-20 ${theme === "dark" ? "bg-zinc-500" : "bg-zinc-400"}`}
          />

          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-8 py-64 scroll-smooth"
            onScroll={handleScroll}
          >
            <div className="space-y-12 max-w-3xl mx-auto">
              {scriptContent.length === 0 ? (
                <p className={theme === "dark" ? "text-zinc-400" : "text-zinc-500"}>
                  No content in this script.
                </p>
              ) : (
                scriptContent.map((block, i) => (
                  <div
                    key={i}
                    ref={(el) => { paragraphRefs.current[i] = el; }}
                    className={`transition-opacity duration-300 ${i === currentIndex ? "opacity-100 scale-105 transform origin-left" : "opacity-40"}`}
                  >
                    <p
                      className="leading-relaxed font-medium"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {block.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 z-20 ${theme === "dark" ? "border-zinc-600/80 bg-zinc-700/70" : "border-zinc-200 bg-zinc-50"}`}
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
              onClick={() => setEndSessionOpen(true)}
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
              onClick={handleSkipBack}
              disabled={scriptContent.length === 0 || currentIndex <= 0}
              aria-label="Previous block"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shrink-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
              onClick={handleSkipForward}
              disabled={scriptContent.length === 0 || currentIndex >= scriptContent.length - 1}
              aria-label="Next block"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 max-w-xs w-full flex items-center gap-4">
            <span
              className={`text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Speed
            </span>
            <Slider
              value={[scrollSpeed]}
              onValueChange={(v) => setScrollSpeed(v[0] ?? 1)}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span
              className={`text-xs font-mono ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {scrollSpeed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 w-full sm:w-auto order-3 shrink-0">
            <div
              className={`flex items-center border rounded-md mr-2 ${theme === "dark" ? "border-zinc-500 bg-zinc-700" : "border-zinc-200 bg-white"}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
                onClick={() => setFontSize((f) => Math.max(16, f - 2))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span
                className={`text-xs font-mono w-8 text-center ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {fontSize}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
                onClick={() => setFontSize((f) => Math.min(48, f + 2))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"}`}
              onClick={() => setShowKeyboardHelp((v) => !v)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"}`}
              onClick={handleFullscreen}
              aria-label="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showKeyboardHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowKeyboardHelp(false)}
          role="dialog"
          aria-label="Keyboard shortcuts"
        >
          <div
            className={`rounded-xl border p-6 max-w-sm w-full shadow-xl ${theme === "dark" ? "bg-zinc-800 border-zinc-600 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Keyboard shortcuts</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowKeyboardHelp(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              <li><kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">Space</kbd> Play / Pause</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">↑</kbd> Previous block</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">→</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">↓</kbd> Next block</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">+</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">−</kbd> Font size</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-200">?</kbd> Show this help</li>
            </ul>
          </div>
        </div>
      )}

      <Dialog open={endSessionOpen} onOpenChange={setEndSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{client ? "End session" : "Finish session"}</DialogTitle>
            <DialogDescription>
              {client
                ? `Save this session to ${client.full_name}'s history. It will appear under Session History on their profile.`
                : "This was a practice session. Return to the dashboard."}
            </DialogDescription>
          </DialogHeader>
          {client && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-type">Session type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="session-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hypnosis">Hypnosis</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-notes">Notes (optional)</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Any notes about this session..."
                  className="min-h-[80px] resize-none"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEndSessionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEndSession} disabled={savingSession}>
              {savingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : client ? (
                "Save & finish"
              ) : (
                "Finish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
