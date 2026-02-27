"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Play,
  Pause,
  Download,
  Mic,
  Music,
  Upload,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import { formatTime } from "./constants";

type Step3PreviewMixProps = {
  activeVoiceUrl: string | null;
  voiceLabel: string;
  audioRef: RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onDownload: () => void;
  onSaveOpen: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  musicFile: File | null;
  musicUrl: string | null;
  voiceLevel: number;
  setVoiceLevel: (v: number) => void;
  musicLevel: number;
  setMusicLevel: (v: number) => void;
  mixCurrentTime: number;
  mixDuration: number;
  mixPlaying: boolean;
  mixError: string | null;
  exportingMix: boolean;
  onMusicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlayMix: () => void;
  onDownloadMix: () => void;
  voiceSourceForMix: { blob: Blob } | { url: string } | null;
  onBack: () => void;
  onNext: () => void;
};

export function Step3PreviewMix({
  activeVoiceUrl,
  voiceLabel,
  audioRef,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onDownload,
  onSaveOpen,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
  musicFile,
  musicUrl,
  voiceLevel,
  setVoiceLevel,
  musicLevel,
  setMusicLevel,
  mixCurrentTime,
  mixDuration,
  mixPlaying,
  mixError,
  exportingMix,
  onMusicUpload,
  onPlayMix,
  onDownloadMix,
  voiceSourceForMix,
  onBack,
  onNext,
}: Step3PreviewMixProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Voice track
                </h3>
                <p className="text-sm text-muted-foreground">{voiceLabel}</p>
              </div>
              <audio
                ref={audioRef}
                src={activeVoiceUrl ?? undefined}
                key={activeVoiceUrl ?? ""}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                onPlay={onPlay}
                onPause={onPause}
              />
              <div className="w-full space-y-2">
                <div className="h-12 w-full bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/20 border-r border-primary/50 transition-all"
                    style={{
                      width: duration
                        ? `${(currentTime / duration) * 100}%`
                        : "0%",
                    }}
                  />
                  <span className="text-xs font-mono text-muted-foreground relative z-10">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full"
                  onClick={onPlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={onSaveOpen}
                  title="Save to your audio list"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Next: Save or download</Button>
        </div>
      </div>
      <div>
        <Card className="h-full flex flex-col border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Audio Mixer</CardTitle>
            <CardDescription>
              Mix voice and music, then download as a single MP3.
            </CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Adjust levels then play to preview. Download when ready.
              </p>
              <div className="space-y-2">
                <Label className="font-medium">Background music</Label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent/50 w-full">
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {musicFile?.name ?? "Upload MP3 or audio file…"}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={onMusicUpload}
                  />
                </label>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Voice level</Label>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {voiceLevel}%
                  </span>
                </div>
                <Slider
                  value={[voiceLevel]}
                  onValueChange={([v]) => setVoiceLevel(v)}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Music level</Label>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {musicLevel}%
                  </span>
                </div>
                <Slider
                  value={[musicLevel]}
                  onValueChange={([v]) => setMusicLevel(v)}
                  max={100}
                  step={1}
                />
              </div>
              <div className="pt-2 space-y-2">
                <div className="h-10 w-full bg-muted rounded-md flex items-center justify-center">
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatTime(mixCurrentTime)} / {formatTime(mixDuration)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={onPlayMix}
                  disabled={
                    !activeVoiceUrl || (!musicUrl && !musicFile)
                  }
                >
                  {mixPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {mixPlaying ? "Pause" : "Play mix"}
                </Button>
              </div>
            </div>
          </ScrollArea>
          <CardFooter className="bg-primary/10 border-t border-primary/20 px-6 py-4 mt-auto flex flex-col gap-2">
            {mixError && (
              <p className="text-sm text-destructive w-full">{mixError}</p>
            )}
            <Button
              className="w-full"
              onClick={onDownloadMix}
              disabled={
                !voiceSourceForMix ||
                (!musicUrl && !musicFile) ||
                exportingMix
              }
            >
              {exportingMix ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download mixed MP3
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
