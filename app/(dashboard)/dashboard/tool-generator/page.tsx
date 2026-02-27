"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, Loader2, Copy, Check, Info } from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";

export default function ToolGeneratorPage() {
  const [presentingIssue, setPresentingIssue] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!presentingIssue.trim()) return;
    setError(null);
    setContent(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tool-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentingIssue: presentingIssue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setContent(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <PageHero
        icon={Wrench}
        title="Tool Generator"
        description="Enter the presenting issue to get specific tools, a session flow, and cautions."
        accentColor="rose"
        backHref="/dashboard"
      />

      <AnimatedSection delay={0.05}>
      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to use this</p>
          <p>
            Use this as a quick reference before or during a session. The output gives you techniques to consider, a suggested flow (induction → deepener → main work → awakening), and cautions. You can copy it into your notes or keep it open in another tab.
          </p>
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
      <Card className="border-border/40 shadow-sm accent-bar accent-bar-rose overflow-hidden bg-accent-rose/[0.06] border-accent-rose/20 hover-lift gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Generate plan</CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe the client&apos;s presenting issue in a few words or sentences.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="issue">Presenting issue</Label>
            <Textarea
              id="issue"
              placeholder="e.g. Generalised anxiety, fear of flying, low self-esteem, smoking cessation, insomnia"
              value={presentingIssue}
              onChange={(e) => setPresentingIssue(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !presentingIssue.trim()}
            className="gap-2 rounded-xl btn-shimmer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4" />
                Generate tools & flow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </AnimatedSection>

      {content && (
        <AnimatedSection delay={0.05}>
          <p className="text-sm text-muted-foreground">
            Copy to your notes or keep this open during the session.
          </p>
          <Card className="border-border/40 accent-bar accent-bar-rose overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Tools, flow & cautions</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 border border-border/40 text-sm text-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_li]:pl-1 [&_p]:my-1.5 [&_strong]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
    </div>
  );
}
