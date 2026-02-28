"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Loader2, Copy, Check, Info } from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { FeatureLockOverlay } from "@/components/dashboard/feature-lock-overlay";
import { AnimatedSection } from "@/components/motion/animated-section";
import { toast } from "sonner";

export default function AffirmationsPage() {
  const [topic, setTopic] = useState("");
  const [affirmations, setAffirmations] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setError(null);
    setAffirmations(null);
    setLoading(true);
    try {
      const res = await fetch("/api/affirmations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setAffirmations(data.affirmations ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!affirmations?.length) return;
    try {
      await navigator.clipboard.writeText(affirmations.join("\n\n"));
      setCopiedIndex("all");
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleRegenerate = () => {
    if (topic.trim()) handleGenerate();
  };

  const handleCopyOne = async (text: string, index: number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <FeatureLockOverlay>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <PageHero
          icon={Sparkles}
          title="Affirmations"
        description="Enter a topic, goal, or intention to generate 10 ready-to-use affirmations."
        accentColor="amber"
        backHref="/dashboard"
      />

      <AnimatedSection delay={0.05}>
      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to use these affirmations</p>
          <p>
            Use them in scripts, record them for clients, or give them as handouts. Each is in second person (“You”) and present tense — spoken to the client rather than by them.
          </p>
          <p>
            <strong>Why “You” instead of “I”?</strong> First-person statements (“I am calm”) can trigger the conscious mind to disagree if it doesn’t yet believe them, so the subconscious may reject the suggestion. Second-person (“You are calm”) is received as a direct suggestion from you to the client, which bypasses that inner resistance — they don’t have to claim the statement, they receive it.
          </p>
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
      <Card className="border-border/40 shadow-sm accent-bar accent-bar-amber overflow-hidden bg-accent-amber/[0.06] border-accent-amber/20 hover-lift gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Generate affirmations</CardTitle>
          <CardDescription>
            Enter a topic, goal, or intention (e.g. confidence, sleep, quit smoking).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / goal / intention</Label>
            <Textarea
              id="topic"
              placeholder="e.g. confidence, better sleep, quit smoking, reduce anxiety, self-worth"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
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
                Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </AnimatedSection>

      {affirmations && affirmations.length > 0 && (
        <AnimatedSection delay={0.05}>
          <p className="text-sm text-muted-foreground">
            Copy all or use the button next to each line to copy a single affirmation.
          </p>
          <Card className="border-border/40 accent-bar accent-bar-amber overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Your 10 affirmations</CardTitle>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="gap-2"
                >
                {copiedIndex === "all" ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy all
                  </>
                )}
              </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {affirmations.map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 border border-border/40 hover-lift shadow-sm transition-shadow"
                  >
                    <span className="flex-1 text-sm text-foreground">{text}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyOne(text, i)}
                      className="gap-2 shrink-0"
                    >
                      {copiedIndex === i ? (
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
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
