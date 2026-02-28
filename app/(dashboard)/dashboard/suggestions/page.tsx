"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks, Sparkles, Loader2, Copy, Check, FileText, Info } from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { FeatureLockOverlay } from "@/components/dashboard/feature-lock-overlay";
import { UsageIndicator } from "@/components/dashboard/usage-indicator";
import { AnimatedSection } from "@/components/motion/animated-section";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { id: "calm", label: "Calm" },
  { id: "authoritative", label: "Authoritative" },
  { id: "nurturing", label: "Nurturing" },
  { id: "direct", label: "Direct" },
  { id: "gentle", label: "Gentle" },
  { id: "warm", label: "Warm" },
  { id: "reassuring", label: "Reassuring" },
];

const SUGGESTION_TYPE_OPTIONS = [
  { id: "direct", label: "Direct" },
  { id: "permissive", label: "Permissive" },
  { id: "compound", label: "Compound" },
  { id: "truism", label: "Truism" },
  { id: "double_bind", label: "Double bind" },
  { id: "contingent", label: "Contingent" },
  { id: "implied", label: "Implied" },
];

export default function SuggestionsPage() {
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("calm");
  const [suggestionTypes, setSuggestionTypes] = useState<string[]>([]);
  const [wording, setWording] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleType = (id: string) => {
    setSuggestionTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setError(null);
    setWording(null);
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          tone,
          suggestionTypes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setWording(data.wording);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (goal.trim()) handleGenerate();
  };

  const handleCopy = async () => {
    if (!wording) return;
    try {
      await navigator.clipboard.writeText(wording);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <FeatureLockOverlay>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <PageHero
          icon={ListChecks}
          title="Suggestions"
          description="Choose a goal, tone and suggestion types to get ready-to-read wording."
          accentColor="emerald"
          backHref="/dashboard"
        />
        <UsageIndicator type="ai_tool" className="mt-2" />

      <AnimatedSection delay={0.05}>
      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to use these suggestions</p>
          <p>
            These are ready-to-speak phrases. Copy them into the middle of a script you like (e.g. after the deepener, before the awakening), or use them as your post-hypnotic suggestions section. You can also drop a few into a full script you generate in Scripts to tailor it to this client.
          </p>
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
      <Card className="border-border/40 shadow-sm accent-bar accent-bar-emerald overflow-hidden bg-primary/[0.04] border-primary/20 hover-lift gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Generate suggestions</CardTitle>
          <CardDescription>
            Describe the client&apos;s goal and how you want the suggestions to sound.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              placeholder="e.g. Feel more confident before presentations, sleep better, reduce anxiety in social situations"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Suggestion types (optional)</Label>
            <div className="flex flex-wrap gap-4">
              {SUGGESTION_TYPE_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={suggestionTypes.includes(o.id)}
                    onCheckedChange={() => toggleType(o.id)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !goal.trim()}
            className="gap-2 rounded-xl btn-shimmer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </AnimatedSection>

      {wording && (
        <AnimatedSection delay={0.05}>
          <p className="text-sm text-muted-foreground">
            Tip: paste these into the middle of a script, or use as your post-hypnotic section. Open Scripts to add them to an existing or new script.
          </p>
          <Card className="border-border/40 accent-bar accent-bar-emerald overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Ready-to-read wording</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/scripts" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Open Scripts
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted/30 rounded-lg p-4 border border-border/40">
                {wording}
              </pre>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
