"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Mic, Plus, Headphones, Loader2, Download, Play, Pause, Trash2, Volume2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

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
  const [deleteTarget, setDeleteTarget] = useState<AudioTrack | null>(null);
  const AUDIO_PAGE_SIZE = 20;
  const [audioPage, setAudioPage] = useState(1);
  const paginatedTracks = tracks.slice(0, audioPage * AUDIO_PAGE_SIZE);
  const hasMoreTracks = tracks.length > paginatedTracks.length;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekDraggingRef = useRef(false);
  const playingTrack = playingId ? tracks.find((t) => t.id === playingId) : null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      if (!seekDraggingRef.current) setCurrentTime(el.currentTime);
    };
    const onLoadedMetadata = () => setDuration(el.duration);
    const onDurationChange = () => setDuration(el.duration);
    const onEnded = () => {
      setPlayUrl(null);
      setPlayingId(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPaused(false);
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("ended", onEnded);
    };
  }, [playUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const handleSeek = (value: number[]) => {
    const t = value[0] ?? 0;
    seekDraggingRef.current = false;
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleSeekDrag = () => {
    seekDraggingRef.current = true;
  };

  useEffect(() => {
    if (!playUrl) {
      setCurrentTime(0);
      setDuration(0);
    }
  }, [playUrl]);

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
      const el = audioRef.current;
      if (isPaused && el) {
        el.play();
        setIsPaused(false);
      } else if (!isPaused && el) {
        el.pause();
        setIsPaused(true);
      }
      return;
    }
    setIsPaused(false);
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
    setDeletingId(track.id);
    if (playingId === track.id) {
      setPlayUrl(null);
      setPlayingId(null);
    }
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([track.file_path]);
    const { error } = await supabase.from("audio_files").delete().eq("id", track.id);
    if (error) toast.error("Could not delete track");
    else {
      toast.success("Track deleted");
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
    }
    setDeletingId(null);
    setDeleteTarget(null);
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
            {paginatedTracks.map((track) => (
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
                      onClick={() => setDeleteTarget(track)}
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
            {hasMoreTracks && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setAudioPage((p) => p + 1)} className="rounded-xl">
                  Load more ({tracks.length - paginatedTracks.length} remaining)
                </Button>
              </div>
            )}
          </div>
        </AnimatedSection>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete audio track"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? "this track"}"? This action cannot be undone.`}
        confirmLabel="Delete track"
        loading={!!deletingId}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />

      {playUrl && (
        <>
          <audio ref={audioRef} src={playUrl} autoPlay />
          <div className="sticky bottom-0 left-0 right-0 z-10 rounded-t-2xl border border-t border-border/40 bg-card shadow-lg p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={() => {
                  const el = audioRef.current;
                  if (isPaused && el) {
                    el.play();
                    setIsPaused(false);
                  } else if (!isPaused && el) {
                    el.pause();
                    setIsPaused(true);
                  }
                }}
                aria-label={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
              </Button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{playingTrack?.title ?? "Playing"}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {formatDuration(Math.floor(currentTime))}
                  </span>
                  <Slider
                    value={[Number.isFinite(duration) && duration > 0 ? currentTime : 0]}
                    max={Number.isFinite(duration) && duration > 0 ? duration : 100}
                    step={0.1}
                    onValueCommit={handleSeek}
                    onValueChange={(v) => {
                      handleSeekDrag();
                      setCurrentTime(v[0] ?? 0);
                    }}
                    className="flex-1 max-w-[200px] sm:max-w-none"
                  />
                  <span className="text-xs font-mono text-muted-foreground tabular-nums w-10">
                    {formatDuration(Number.isFinite(duration) ? Math.floor(duration) : null)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-24 shrink-0">
                <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => setVolume(v[0] ?? 1)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
