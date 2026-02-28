"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Loader2, Trash2, Wrench } from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { FeatureLockOverlay } from "@/components/dashboard/feature-lock-overlay";
import { AnimatedSection } from "@/components/motion/animated-section";

type Message = { role: "user" | "assistant"; content: string };

export default function ReflectionRoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const res = await fetch("/api/reflection-room/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages: [...messages, userMessage],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearThread = () => {
    setMessages([]);
    setError(null);
    setInput("");
  };

  return (
    <FeatureLockOverlay>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <PageHero
          icon={MessageCircle}
          title="Reflection Room"
        description="Chat through client work in confidence. Nothing is saved."
        accentColor="rose"
        backHref="/dashboard"
      />

      <AnimatedSection delay={0.05}>
        <p className="text-xs text-muted-foreground border border-border/40 rounded-lg bg-muted/20 px-3 py-2">
          This conversation is confidential and is not stored. Refreshing or starting a new conversation clears the thread.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
      <div className="relative">
        <div className="absolute -inset-1 rounded-3xl bg-accent-rose/10 blur-xl pointer-events-none" />
        <Card className="relative border-border/40 flex flex-col min-h-[420px] accent-bar accent-bar-rose overflow-hidden shadow-lg bg-accent-rose/[0.04] border-accent-rose/20 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Chat</CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearThread}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
              New conversation
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 p-0">
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 min-h-[240px] max-h-[50vh]">
            {messages.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground py-8">
                Type a message below to start. Use this space to chat through client cases, tricky sessions, ethics or boundaries—the AI is here to listen and ask helpful questions as a reflective partner.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg px-4 py-3 ${
                  m.role === "user"
                    ? "bg-primary/10 text-foreground ml-4"
                    : "bg-muted/50 text-foreground mr-4"
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {m.role === "user" ? "You" : "Reflection partner"}
                </p>
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {error && (
            <p className="text-sm text-destructive px-6 pb-2">{error}</p>
          )}
          <div className="border-t border-border/40 p-4 space-y-2">
            <Textarea
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none min-h-[72px]"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="gap-2 rounded-xl btn-shimmer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
      <p className="text-xs text-muted-foreground">
        This tool is for reflection support only and is not a substitute for formal supervision or legal/clinical advice.
      </p>

      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-4 space-y-2 accent-bar accent-bar-rose overflow-hidden">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          Use with the Tool Generator
        </p>
        <p className="text-sm text-muted-foreground">
          Once you’ve reflected on a client here, head to the{" "}
          <Link href="/dashboard/tool-generator" className="text-primary font-medium underline-offset-4 hover:underline">
            Tool Generator
          </Link>{" "}
          and enter the presenting issue. You’ll get tailored tools, a suggested session flow and cautions for that client. Reflection Room helps you think it through; the Tool Generator turns that into a practical plan.
        </p>
      </div>
      </AnimatedSection>
      </div>
    </FeatureLockOverlay>
  );
}
