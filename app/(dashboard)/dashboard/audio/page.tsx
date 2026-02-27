"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Plus, Headphones, Loader2, Download, Play, Pause, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";

const BUCKET = "audio";

type AudioTrack = {
  id: string;
  title: string;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(sec: number | null): string {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioListPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("audio_files")
        .select("id, title, file_path, duration_seconds, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setTracks((data as AudioTrack[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handlePlay = async (track: AudioTrack) => {
    if (playingId === track.id) {
      setPlayUrl(null);
      setPlayingId(null);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(track.file_path, 3600);
    if (data?.signedUrl) {
      setPlayUrl(data.signedUrl);
      setPlayingId(track.id);
    }
  };

  const handleDownload = async (track: AudioTrack) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(track.file_path, 3600);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = `${track.title.replace(/[^\w\s-]/g, "")}.mp3`;
      a.click();
    }
  };

  const handleDelete = async (track: AudioTrack) => {
    if (!confirm(`Delete "${track.title}"? This cannot be undone.`)) return;
    setDeletingId(track.id);
    if (playingId === track.id) {
      setPlayUrl(null);
      setPlayingId(null);
    }
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([track.file_path]);
    await supabase.from("audio_files").delete().eq("id", track.id);
    setTracks((prev) => prev.filter((t) => t.id !== track.id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-12">
      <PageHero
        icon={Mic}
        title="Audio"
        description="Your saved voice tracks. Create new ones in the Audio Studio; mix voice and music, then download MP3."
        accentColor="teal"
      >
        <Link href="/dashboard/audio/new">
          <Button className="rounded-xl h-11 px-6 btn-shimmer gap-2">
            <Plus className="h-4 w-4" />
            Create new
          </Button>
        </Link>
      </PageHero>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tracks.length === 0 ? (
        <AnimatedSection delay={0.05}>
          <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm p-12 text-center">
            <Headphones className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
            <h2 className="font-serif text-lg font-medium text-foreground">No saved tracks yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Generate a voice track from a script in the Audio Studio, then save it here to see it in this list.
            </p>
            <Link href="/dashboard/audio/new" className="mt-6 inline-block">
              <Button className="rounded-xl btn-shimmer gap-2">
                <Mic className="h-4 w-4" />
                Create new voice track
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={0.05}>
          <div className="space-y-3">
            {tracks.map((track) => (
              <Card
                key={track.id}
                className="overflow-hidden accent-bar accent-bar-teal bg-accent-teal/[0.06] border-accent-teal/20 hover-lift shadow-sm"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDuration(track.duration_seconds)} · Saved {formatDate(track.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      onClick={() => handlePlay(track)}
                      aria-label={playingId === track.id ? "Pause" : "Play"}
                    >
                      {playingId === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      onClick={() => handleDownload(track)}
                      aria-label="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      onClick={() => handleDelete(track)}
                      disabled={deletingId === track.id}
                      title="Delete"
                      aria-label="Delete"
                    >
                      {deletingId === track.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>
      )}

      {playUrl && (
        <audio
          src={playUrl}
          autoPlay
          onEnded={() => {
            setPlayUrl(null);
            setPlayingId(null);
          }}
          className="hidden"
        />
      )}
    </div>
  );
}
