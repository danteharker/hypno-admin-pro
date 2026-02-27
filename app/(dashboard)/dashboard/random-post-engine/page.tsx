"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rss, Loader2, Copy, Check, Info, Twitter, Facebook, Linkedin, BookOpen } from "lucide-react";
import type { Platform } from "@/lib/prompts/random-post-engine";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";

const PLATFORMS: {
  id: Platform;
  label: string;
  icon: React.ElementType;
  hint: string;
}[] = [
  { id: "x", label: "X / Twitter", icon: Twitter, hint: "3 tweets · max 280 characters each" },
  { id: "facebook", label: "Facebook", icon: Facebook, hint: "3 posts · 80–150 words each" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, hint: "3 posts · professional, 100–200 words" },
  { id: "blog", label: "Blog ideas", icon: BookOpen, hint: "3 ideas · title + outline" },
];

const RESULT_LABEL: Record<Platform, string> = {
  x: "Your tweets",
  facebook: "Your Facebook posts",
  linkedin: "Your LinkedIn posts",
  blog: "Your blog ideas",
};

const HOW_TO_USE: Record<Platform, string> = {
  x: "Each tweet is under 280 characters and ready to post directly on X. Use the copy button on the one you want.",
  facebook: "Three varied Facebook posts — one educational, one personal, one call-to-action. Copy the one you want with its button.",
  linkedin: "Three professional LinkedIn posts — thought leadership, a personal story, and a practical tip. Copy the one you want with its button.",
  blog: "Three blog post ideas with a title and short outline. Use these as a brief for writing, or paste one into the Script Generator to develop it further.",
};

/** Split markdown content by ## headings into [{ title, body, copyText }]. */
function splitPosts(content: string): { title: string; body: string; copyText: string }[] {
  const raw = content
    .split(/\n## /)
    .map((s) => s.replace(/^## /, "").trim())
    .filter(Boolean);
  return raw.map((block) => {
    const firstNewline = block.indexOf("\n");
    const title = firstNewline === -1 ? block.trim() : block.slice(0, firstNewline).trim();
    const body = firstNewline === -1 ? "" : block.slice(firstNewline + 1).trim();
    return { title, body, copyText: body };
  });
}

export default function RandomPostEnginePage() {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [services, setServices] = useState("");
  const [themes, setThemes] = useState("");
  const [expertise, setExpertise] = useState("");
  const [link, setLink] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);

  const canGenerate =
    services.trim().length > 0 &&
    themes.trim().length > 0 &&
    expertise.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    setContent(null);
    setLoading(true);
    try {
      const res = await fetch("/api/random-post-engine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: services.trim(),
          themes: themes.trim(),
          expertise: expertise.trim(),
          platform,
          link: link.trim() || undefined,
        }),
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

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    setContent(null);
    setError(null);
  };

  const handleCopyAll = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopiedIndex("all");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyOne = async (text: string, index: number) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <PageHero
        icon={Rss}
        title="Random Post Engine"
        description="Generate ready-to-publish content tailored to your chosen platform."
        accentColor="teal"
        backHref="/dashboard"
      />

      <AnimatedSection delay={0.05}>
      {/* Platform selector */}
      <div className="space-y-2">
        <Label>Platform</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLATFORMS.map(({ id, label, icon: Icon, hint }) => {
            const isActive = platform === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handlePlatformChange(id)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover-lift shadow-sm ${
                  isActive
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border/40 bg-card/50 text-muted-foreground hover:border-primary/30 hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span>{label}</span>
                <span className={`text-xs font-normal text-center leading-snug ${isActive ? "text-primary/70" : "text-muted-foreground"}`}>
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
      {/* How to use */}
      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to use this</p>
          <p>{HOW_TO_USE[platform]}</p>
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
      <Card className="border-border/40 shadow-sm accent-bar accent-bar-teal overflow-hidden bg-accent-teal/[0.06] border-accent-teal/20 hover-lift gradient-border">
        <CardHeader>
          <CardTitle className="text-lg">Your details</CardTitle>
          <p className="text-sm text-muted-foreground">
            The more detail you add, the more tailored the content will be.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="services">Services offered</Label>
            <Textarea
              id="services"
              placeholder="e.g. One-to-one hypnotherapy, online sessions, smoking cessation programmes, weight management"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="themes">Themes / topics</Label>
            <Textarea
              id="themes"
              placeholder="e.g. Anxiety relief, confidence, sleep, phobias, stress at work, mindset"
              value={themes}
              onChange={(e) => setThemes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Areas of expertise</Label>
            <Textarea
              id="expertise"
              placeholder="e.g. Clinical hypnotherapist, 10 years' experience, specialise in trauma and anxiety, trained in NLP"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Website or social link (optional)</Label>
            <Input
              id="link"
              type="url"
              placeholder="e.g. https://yoursite.com or https://linkedin.com/in/yourname"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll weave this into posts where it fits (e.g. &quot;Book at…&quot;, &quot;Visit…&quot;). On X, the link counts toward 280 characters so we use it sparingly.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="gap-2 rounded-xl btn-shimmer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Rss className="h-4 w-4" />
                Generate {PLATFORMS.find((p) => p.id === platform)?.label} content
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </AnimatedSection>

      {content && (() => {
        const posts = splitPosts(content);
        const showPerPost = posts.length >= 2;
        return (
          <AnimatedSection delay={0.05}>
            <p className="text-sm text-muted-foreground">
              {showPerPost
                ? "Copy the one you want with its button, or copy all three at once."
                : "Copy to paste into your post."}
            </p>
            <Card className="border-border/40 accent-bar accent-bar-teal overflow-hidden shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{RESULT_LABEL[platform]}</CardTitle>
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
              </CardHeader>
              <CardContent>
                {showPerPost ? (
                  <div className="space-y-5">
                    {posts.map(({ title, body, copyText }, i) => (
                      <div
                        key={i}
                        className="bg-muted/30 rounded-lg p-4 border border-border/40 hover-lift shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-semibold text-foreground">
                            {title}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyOne(copyText, i)}
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
                        </div>
                        <div className="text-sm text-foreground [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_li]:pl-1 [&_p]:my-1.5 [&_strong]:font-semibold [&_hr]:my-4 [&_hr]:border-border/40">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/40 text-sm text-foreground [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_li]:pl-1 [&_p]:my-1.5 [&_strong]:font-semibold [&_hr]:my-4 [&_hr]:border-border/40">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        );
      })()}
    </div>
  );
}
