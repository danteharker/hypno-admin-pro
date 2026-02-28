"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mixAndExportMp3 } from "@/lib/audio-mixer";
import { FeatureLockOverlay } from "@/components/dashboard/feature-lock-overlay";
import { UsageIndicator } from "@/components/dashboard/usage-indicator";
import { WizardProgress } from "@/components/audio-studio/wizard-progress";
import { Step1ChooseScript, type ScriptOption, type LibraryScriptOption } from "@/components/audio-studio/step-1-choose-script";
import { Step2ChooseVoice } from "@/components/audio-studio/step-2-choose-voice";
import { Step3PreviewMix } from "@/components/audio-studio/step-3-preview-mix";
import { Step4SaveDownload } from "@/components/audio-studio/step-4-save-download";
import { MAX_SCRIPT_LENGTH, PREVIEW_PHRASE, VOICE_OPTIONS, PACING_OPTIONS } from "@/components/audio-studio/constants";

const BUCKET = "audio";

export default function AudioStudioNewPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [scriptText, setScriptText] = useState("");
  const [voiceId, setVoiceId] = useState<string>("onyx");
  const [pacing, setPacing] = useState<string>("slow");
  const [scripts, setScripts] = useState<ScriptOption[]>([]);
  const [scriptsLoading, setScriptsLoading] = useState(true);
  const [libraryScripts, setLibraryScripts] = useState<LibraryScriptOption[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateElapsed, setGenerateElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Audio Mixer: voice + music, real-time levels, export MP3
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [voiceLevel, setVoiceLevel] = useState(85);
  const [musicLevel, setMusicLevel] = useState(40);
  const [mixPlaying, setMixPlaying] = useState(false);
  const [mixCurrentTime, setMixCurrentTime] = useState(0);
  const [mixDuration, setMixDuration] = useState(0);
  const [exportingMix, setExportingMix] = useState(false);
  const [mixError, setMixError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const mixStartTimeRef = useRef<number>(0);
  const mixIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Record or upload your own voice (alternative to TTS)
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadedVoiceFile, setUploadedVoiceFile] = useState<File | null>(null);
  const [uploadedVoiceUrl, setUploadedVoiceUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);

  // Active voice for playback and mixer: recorded > uploaded > generated
  const activeVoiceUrl = recordedUrl ?? uploadedVoiceUrl ?? generatedAudioUrl;

  useEffect(() => {
    if (recordedUrl) return () => { URL.revokeObjectURL(recordedUrl); };
  }, [recordedUrl]);
  useEffect(() => {
    if (uploadedVoiceUrl) return () => { URL.revokeObjectURL(uploadedVoiceUrl); };
  }, [uploadedVoiceUrl]);

  useEffect(() => {
    if (!isRecording) {
      setRecordElapsed(0);
      return;
    }
    recordStartRef.current = Date.now();
    const interval = setInterval(() => {
      setRecordElapsed(Math.floor((Date.now() - recordStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setScriptsLoading(false);
        return;
      }
      const { data, error: e } = await supabase
        .from("scripts")
        .select("id, title, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (!e && data) setScripts((data as ScriptOption[]) ?? []);
      setScriptsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error: e } = await supabase
        .from("library_scripts")
        .select("id, title, content, category, tags")
        .order("title");
      if (!e && data) setLibraryScripts((data as LibraryScriptOption[]) ?? []);
      setLibraryLoading(false);
    })();
  }, []);

  useEffect(() => {
    const url = generatedAudioUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [generatedAudioUrl]);

  useEffect(() => {
    const url = previewAudioUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [previewAudioUrl]);

  useEffect(() => {
    if (musicUrl) return () => { URL.revokeObjectURL(musicUrl); };
  }, [musicUrl]);

  useEffect(() => {
    if (!isGenerating) {
      setGenerateElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setGenerateElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleScriptSelect = (scriptId: string) => {
    if (scriptId === "__none__") {
      setScriptText("");
      return;
    }
    const script = scripts.find((s) => s.id === scriptId);
    if (script) setScriptText(script.content.slice(0, MAX_SCRIPT_LENGTH));
  };

  const handleLibraryScriptSelect = (script: LibraryScriptOption) => {
    setScriptText(script.content.slice(0, MAX_SCRIPT_LENGTH));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isTxt = file.name.toLowerCase().endsWith(".txt");
    if (!isTxt) {
      setError("Please upload a .txt file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "").slice(0, MAX_SCRIPT_LENGTH);
      setScriptText(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePreviewVoice = async (previewId: string) => {
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setPreviewVoiceId(previewId);
    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: PREVIEW_PHRASE,
          voiceId: previewId,
          pacing,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Preview failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewAudioUrl(url);
      setPreviewVoiceId(null);
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPreviewAudioUrl(null);
      };
      await audio.play();
    } catch {
      setPreviewVoiceId(null);
    }
  };

  const handleGenerate = async () => {
    const text = scriptText.trim().slice(0, MAX_SCRIPT_LENGTH);
    if (!text) {
      setError("Enter or paste script text, or choose a script from My Scripts.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    if (generatedAudioUrl) {
      URL.revokeObjectURL(generatedAudioUrl);
      setGeneratedAudioUrl(null);
    }
    setGeneratedBlob(null);
    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId, pacing }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      setGeneratedBlob(blob);
      setDuration(0);
      setCurrentTime(0);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const blob = voiceBlobForSaveOrDownload;
    if (!blob) return;
    const name = uploadedVoiceFile ? uploadedVoiceFile.name : recordedBlob ? "voice-track.webm" : "voice-track.mp3";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleSaveOpen = () => {
    setSaveTitle("");
    setSaveError(null);
    setSaveOpen(true);
  };

  const handleStartRecord = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access is needed to record.");
    }
  };

  const handleStopRecord = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const handleUploadVoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedVoiceUrl) URL.revokeObjectURL(uploadedVoiceUrl);
    setUploadedVoiceUrl(URL.createObjectURL(file));
    setUploadedVoiceFile(file);
    setError(null);
    e.target.value = "";
  };

  const clearRecordedVoice = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
  };
  const clearUploadedVoice = () => {
    if (uploadedVoiceUrl) URL.revokeObjectURL(uploadedVoiceUrl);
    setUploadedVoiceUrl(null);
    setUploadedVoiceFile(null);
  };

  const voiceBlobForSaveOrDownload = recordedBlob ?? (uploadedVoiceFile ?? generatedBlob);
  const voiceSourceForMix = recordedBlob
    ? { blob: recordedBlob }
    : uploadedVoiceFile
      ? { blob: uploadedVoiceFile }
      : generatedBlob
        ? { blob: generatedBlob }
        : generatedAudioUrl
          ? { url: generatedAudioUrl }
          : null;
  const hasVoice = !!activeVoiceUrl;
  const voiceLabel = recordedBlob
    ? "Recorded voice"
    : uploadedVoiceFile
      ? `Uploaded: ${uploadedVoiceFile.name}`
      : generatedAudioUrl
        ? `${VOICE_OPTIONS.find((o) => o.value === voiceId)?.label ?? voiceId} • ${PACING_OPTIONS.find((o) => o.value === pacing)?.label ?? pacing}`
        : "";

  const handleSave = async () => {
    if (!voiceBlobForSaveOrDownload || !saveTitle.trim()) {
      setSaveError("Please enter a title.");
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaveError("You must be signed in to save.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const id = crypto.randomUUID();
      const isWebm = !!recordedBlob;
      const filePath = `${user.id}/${id}.${isWebm ? "webm" : "mp3"}`;
      const blob = voiceBlobForSaveOrDownload;
      const contentType = isWebm ? "audio/webm" : uploadedVoiceFile ? (uploadedVoiceFile.type || "audio/mpeg") : "audio/mpeg";
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType,
          upsert: true,
        });
      if (uploadError) throw new Error(uploadError.message);
      const durationSeconds = Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null;
      const { error: insertError } = await supabase.from("audio_files").insert({
        id,
        user_id: user.id,
        title: saveTitle.trim(),
        file_path: filePath,
        duration_seconds: durationSeconds,
      });
      if (insertError) throw new Error(insertError.message);
      setSaveOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      setSaveError(
        msg.toLowerCase().includes("bucket")
          ? "Storage bucket ‘audio’ is missing. Create it in Supabase: Dashboard → Storage → New bucket, name: audio (private)."
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  // ——— Audio Mixer: real-time playback via Web Audio API ———
  const voiceGain = voiceLevel / 100;
  const musicGain = musicLevel / 100;

  const stopMixPlayback = useCallback(() => {
    if (mixIntervalRef.current) {
      clearInterval(mixIntervalRef.current);
      mixIntervalRef.current = null;
    }
    try {
      voiceSourceRef.current?.stop();
      musicSourceRef.current?.stop();
    } catch {}
    voiceSourceRef.current = null;
    musicSourceRef.current = null;
    voiceGainRef.current = null;
    musicGainRef.current = null;
    setMixPlaying(false);
  }, []);

  const playMix = useCallback(async () => {
    setMixError(null);
    if (!activeVoiceUrl) {
      setMixError("Please generate, record or upload a voice track first.");
      return;
    }
    let musicSrc = musicUrl;
    if (!musicSrc && musicFile) {
      musicSrc = URL.createObjectURL(musicFile);
      setMusicUrl(musicSrc);
    }
    if (!musicSrc) {
      setMixError("Please add a background music file.");
      return;
    }

    const ctx = audioContextRef.current ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (!audioContextRef.current) audioContextRef.current = ctx;

    if (mixPlaying) {
      stopMixPlayback();
      return;
    }

    const voiceUrl = activeVoiceUrl;
    try {
      const [voiceBuf, musicBuf] = await Promise.all([
        fetch(voiceUrl).then((r) => r.arrayBuffer()).then((ab) => ctx.decodeAudioData(ab.slice(0))),
        fetch(musicSrc).then((r) => r.arrayBuffer()).then((ab) => ctx.decodeAudioData(ab.slice(0))),
      ]);
      const dest = ctx.createGain();
      dest.connect(ctx.destination);

      const vGain = ctx.createGain();
      vGain.gain.value = voiceGain;
      vGain.connect(dest);
      const mGain = ctx.createGain();
      mGain.gain.value = musicGain;
      mGain.connect(dest);

      const voiceSrc = ctx.createBufferSource();
      voiceSrc.buffer = voiceBuf;
      voiceSrc.connect(vGain);
      const musicSrcNode = ctx.createBufferSource();
      musicSrcNode.buffer = musicBuf;
      musicSrcNode.connect(mGain);

      const maxLen = Math.max(voiceBuf.duration, musicBuf.duration);
      setMixDuration(maxLen);
      setMixCurrentTime(0);
      mixStartTimeRef.current = ctx.currentTime;

      voiceSrc.start(0);
      musicSrcNode.start(0);
      voiceSourceRef.current = voiceSrc;
      musicSourceRef.current = musicSrcNode;
      voiceGainRef.current = vGain;
      musicGainRef.current = mGain;

      voiceSrc.onended = () => { stopMixPlayback(); };

      setMixPlaying(true);
      mixIntervalRef.current = setInterval(() => {
        const elapsed = ctx.currentTime - mixStartTimeRef.current;
        if (elapsed >= maxLen) {
          stopMixPlayback();
          setMixCurrentTime(maxLen);
          return;
        }
        setMixCurrentTime(elapsed);
      }, 200);
    } catch (e) {
      setMixError(e instanceof Error ? e.message : "Could not play mix.");
      setMixPlaying(false);
    }
  }, [activeVoiceUrl, musicUrl, musicFile, voiceGain, musicGain, mixPlaying, stopMixPlayback]);

  useEffect(() => {
    if (!mixPlaying || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const t = ctx.currentTime;
    if (voiceGainRef.current) voiceGainRef.current.gain.setValueAtTime(voiceGain, t);
    if (musicGainRef.current) musicGainRef.current.gain.setValueAtTime(musicGain, t);
  }, [voiceLevel, musicLevel, mixPlaying]);

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (musicUrl) URL.revokeObjectURL(musicUrl);
    setMusicUrl(URL.createObjectURL(file));
    setMusicFile(file);
    setMixError(null);
    e.target.value = "";
  };

  const handleDownloadMix = async () => {
    setMixError(null);
    if (!voiceSourceForMix) {
      setMixError("Please generate, record or upload a voice track first.");
      return;
    }
    if (!musicFile && !musicUrl) {
      setMixError("Please add a background music file.");
      return;
    }
    setExportingMix(true);
    try {
      const musicSource = musicFile ? { blob: musicFile } : { url: musicUrl! };
      const blob = await mixAndExportMp3(voiceSourceForMix, musicSource, voiceGain, musicGain);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mixed-track.mp3";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setMixError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExportingMix(false);
    }
  };

  return (
    <FeatureLockOverlay>
      <div className="space-y-6 max-w-6xl mx-auto w-full pb-12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audio" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audio Studio</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Turn scripts into professional audio sessions. Layer voices, ambient sounds, and binaural beats.
            </p>
            <UsageIndicator type="audio_generation" className="mt-2" />
          </div>
        </div>

        <WizardProgress currentStep={currentStep} />

      {/* Step 1: Choose script */}
      {currentStep === 1 && (
        <Step1ChooseScript
          scriptText={scriptText}
          setScriptText={setScriptText}
          scripts={scripts}
          scriptsLoading={scriptsLoading}
          libraryScripts={libraryScripts}
          libraryLoading={libraryLoading}
          error={error}
          onScriptSelect={handleScriptSelect}
          onLibraryScriptSelect={handleLibraryScriptSelect}
          onFileUpload={handleFileUpload}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* Step 2: Choose voice — AI or own */}
      {currentStep === 2 && (
        <Step2ChooseVoice
          scriptText={scriptText}
          voiceId={voiceId}
          setVoiceId={setVoiceId}
          pacing={pacing}
          setPacing={setPacing}
          error={error}
          isGenerating={isGenerating}
          generateElapsed={generateElapsed}
          onPreviewVoice={handlePreviewVoice}
          previewVoiceId={previewVoiceId}
          onGenerate={handleGenerate}
          isRecording={isRecording}
          recordElapsed={recordElapsed}
          recordedUrl={recordedUrl}
          uploadedVoiceUrl={uploadedVoiceUrl}
          recordedBlob={recordedBlob}
          uploadedVoiceFile={uploadedVoiceFile}
          onStartRecord={handleStartRecord}
          onStopRecord={handleStopRecord}
          onUploadVoice={handleUploadVoice}
          onClearRecorded={clearRecordedVoice}
          onClearUploaded={clearUploadedVoice}
          onBack={() => setCurrentStep(1)}
          onContinueToPreview={() => setCurrentStep(3)}
        />
      )}

      {/* Step 3: Preview and mix */}
      {currentStep === 3 && !hasVoice && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Generate or record a voice track in step 2 first.</p>
            <Button variant="outline" className="mt-4" onClick={() => setCurrentStep(2)}>Back to Choose voice</Button>
          </CardContent>
        </Card>
      )}
      {currentStep === 3 && hasVoice && (
        <Step3PreviewMix
          activeVoiceUrl={activeVoiceUrl}
          voiceLabel={voiceLabel}
          audioRef={audioRef}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onDownload={handleDownload}
          onSaveOpen={handleSaveOpen}
          onTimeUpdate={() => { const a = audioRef.current; if (a) setCurrentTime(a.currentTime); }}
          onLoadedMetadata={() => { const a = audioRef.current; if (a) setDuration(a.duration); }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          musicFile={musicFile}
          musicUrl={musicUrl}
          voiceLevel={voiceLevel}
          setVoiceLevel={setVoiceLevel}
          musicLevel={musicLevel}
          setMusicLevel={setMusicLevel}
          mixCurrentTime={mixCurrentTime}
          mixDuration={mixDuration}
          mixPlaying={mixPlaying}
          mixError={mixError}
          exportingMix={exportingMix}
          onMusicUpload={handleMusicUpload}
          onPlayMix={playMix}
          onDownloadMix={handleDownloadMix}
          voiceSourceForMix={voiceSourceForMix}
          onBack={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
        />
      )}

      {/* Step 4: Save / Download */}
      {currentStep === 4 && hasVoice && (
        <Step4SaveDownload
          onDownloadVoice={handleDownload}
          onDownloadMix={handleDownloadMix}
          onSaveOpen={handleSaveOpen}
          hasMusic={!!(musicFile || musicUrl)}
          exportingMix={exportingMix}
          onBackToPreview={() => setCurrentStep(3)}
        />
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save voice track</DialogTitle>
            <DialogDescription>
              Give this track a name so you can find it in your Audio list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="save-title">Title</Label>
            <Input
              id="save-title"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Deep relaxation script"
            />
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !saveTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </FeatureLockOverlay>
  );
}
