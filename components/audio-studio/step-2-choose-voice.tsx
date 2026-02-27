"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Upload, Volume2, Loader2, Circle, Square } from "lucide-react";
import { formatTime, VOICE_OPTIONS, PACING_OPTIONS } from "./constants";

type Step2ChooseVoiceProps = {
  scriptText: string;
  voiceId: string;
  setVoiceId: (v: string) => void;
  pacing: string;
  setPacing: (v: string) => void;
  error: string | null;
  isGenerating: boolean;
  generateElapsed: number;
  onPreviewVoice: (voiceId: string) => void;
  previewVoiceId: string | null;
  onGenerate: () => void;
  isRecording: boolean;
  recordElapsed: number;
  recordedUrl: string | null;
  uploadedVoiceUrl: string | null;
  recordedBlob: Blob | null;
  uploadedVoiceFile: File | null;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onUploadVoice: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearRecorded: () => void;
  onClearUploaded: () => void;
  onBack: () => void;
  onContinueToPreview: () => void;
};

export function Step2ChooseVoice({
  scriptText,
  voiceId,
  setVoiceId,
  pacing,
  setPacing,
  error,
  isGenerating,
  generateElapsed,
  onPreviewVoice,
  previewVoiceId,
  onGenerate,
  isRecording,
  recordElapsed,
  recordedUrl,
  uploadedVoiceUrl,
  recordedBlob,
  uploadedVoiceFile,
  onStartRecord,
  onStopRecord,
  onUploadVoice,
  onClearRecorded,
  onClearUploaded,
  onBack,
  onContinueToPreview,
}: Step2ChooseVoiceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5" />
            AI Voice
          </CardTitle>
          <CardDescription>
            Generate a voice track from your script using an AI voice and
            pacing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AI Voice Model</Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pacing</Label>
              <Select value={pacing} onValueChange={setPacing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACING_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview voice</Label>
            <div className="flex flex-wrap gap-2">
              {VOICE_OPTIONS.map((o) => (
                <Button
                  key={o.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPreviewVoice(o.value)}
                  disabled={!!previewVoiceId || isGenerating}
                >
                  {previewVoiceId === o.value ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4 mr-1.5" />
                  )}
                  {o.label.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t flex flex-col gap-2">
          {error && (
            <p className="text-sm text-destructive w-full">{error}</p>
          )}
          {isGenerating && (
            <p className="text-sm text-muted-foreground w-full">
              Generating… {formatTime(generateElapsed)}
            </p>
          )}
          <Button
            className="w-full"
            onClick={onGenerate}
            disabled={isGenerating || !scriptText.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Voice Track"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">My Voice</CardTitle>
          <CardDescription>
            Record with your microphone or upload an existing voice file. Use
            the script as a teleprompter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
          {scriptText.trim() ? (
            <div className="space-y-2 flex-1 min-h-0 flex flex-col">
              <Label className="text-sm font-medium">
                Script (read while recording)
              </Label>
              <ScrollArea className="flex-1 min-h-[160px] rounded-md border p-4 bg-muted/30">
                <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {scriptText}
                </p>
              </ScrollArea>
            </div>
          ) : null}
          {isRecording && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <span className="relative flex h-3 w-3" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-medium text-destructive">REC</span>
              <span className="text-sm font-mono tabular-nums">
                {formatTime(recordElapsed)}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            {!isRecording ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onStartRecord}
                className="gap-2"
              >
                <Circle className="h-4 w-4 fill-red-500 text-red-500" />
                Record voice
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onStopRecord}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent/50">
              <Upload className="h-4 w-4" />
              Upload voice file
              <input
                type="file"
                accept="audio/*"
                className="sr-only"
                onChange={onUploadVoice}
              />
            </label>
            {(recordedUrl || uploadedVoiceUrl) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={recordedUrl ? onClearRecorded : onClearUploaded}
              >
                Clear
              </Button>
            )}
          </div>
          {(recordedBlob || uploadedVoiceFile) && (
            <p className="text-xs text-muted-foreground">
              {recordedBlob
                ? "Recorded voice ready."
                : `Uploaded: ${uploadedVoiceFile?.name}`}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onContinueToPreview}
            disabled={!recordedUrl && !uploadedVoiceUrl}
          >
            Continue to preview
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
