# Audio Mixer – Build Prompt (Hypno Admin Pro)

Use this prompt to implement the **Audio Mixer** feature so it can be ticked off in `hypnobuddy-features-checklist.md`. British English throughout.

---

## What it is

An in-app tool that lets the user **mix a voice track with background music (and optionally other ambient layers) in real time**, then **download the result as a single MP3** — an Audacity-style workflow without leaving the app. No requirement to host or stream the mixed file long-term; the main goal is **preview in the browser + download**.

---

## Context in the app

- **Hypno Admin Pro** is a Next.js app (dashboard under `/dashboard/*`). Auth via Supabase (`createClient` from `@/lib/supabase/server` for API routes, `@/lib/supabase/client` for client). British English for all user-facing and system text.
- **Existing audio**: 
  - **Audio** section: list at `/dashboard/audio`, “Audio Studio” at `/dashboard/audio/new` — script → TTS (OpenAI) → voice-only MP3; play, download, save to Supabase storage. There is already an **Ambient Mixer** card on the Audio Studio page with sliders (e.g. Ocean Waves, Solfeggio, Brown Noise, Binaural) and a disabled “Export Final Mix (MP3)” button. The mixer logic and export are **not** implemented.
  - **Affirmations**: has voice + music mixing with level sliders and download; reuse that pattern if it fits (e.g. how they combine tracks and export).
- **Reuse**: Same UI patterns (Card, Slider, Button, Select), same auth-only API style, same Supabase storage bucket `audio` if you choose to optionally save mixed files.

---

## Scope (what to build)

1. **Inputs**
   - **Voice track**: Either (a) use the existing “Generate Voice Track” flow on the same page (user generates TTS, then mixes), or (b) allow upload of an existing voice MP3 (e.g. from their Audio list or file picker). Prefer reusing the current Audio Studio voice generation so the mixer lives in one place.
   - **Background music**: User uploads an MP3 (or other supported format) as “background music”, or picks from a small set of built-in/in-app options if you provide them. At least one source (upload or preset) must work.

2. **Real-time mixing (in the browser)**
   - **Level controls**: Separate volume sliders for “Voice” and “Music” (and optionally one or two more layers, e.g. “Ambient” or “Noise”, if you keep the existing Ambient Mixer idea). Changes to sliders update playback **in real time** (no need to “apply” before hearing).
   - **Playback**: Single “Play” that plays the combined mix as the user hears it (voice + music at chosen levels). Pause, seek, and time display (e.g. current time / duration) where feasible.
   - Implementation note: Use the **Web Audio API** in the browser to mix two (or more) sources and play them together with per-source gain. No need to export a file for preview; export is a separate step.

3. **Export / download**
   - **Download as MP3**: A button (e.g. “Download mixed MP3” or “Export Final Mix (MP3)”) that produces a single MP3 file combining voice + music at the current slider levels. The file should be the same length as the longest track (or voice), with the shorter track(s) ending or looping as you define (typical: music under voice, same length or music fades/loops).
   - **How to produce the MP3**: Either (1) **Client-side**: Use Web Audio API to decode both tracks, mix in an OfflineAudioContext at the chosen gains, then encode to WAV/MP3 (e.g. with a library like `lamejs` or similar for MP3 in the browser) and trigger download. Or (2) **Server-side**: Send voice and music URLs/blobs to an API route that mixes them (e.g. with `ffmpeg` or a Node audio library) and returns the MP3. Choose based on bundle size, backend constraints, and reliability. Document the choice briefly.

4. **Optional**
   - **Save mixed track to Audio list**: If the app already has “Save to your audio list” for the voice track, consider allowing “Save mixed track” so the mixed MP3 is uploaded to Supabase storage and appears in `/dashboard/audio`. Not required for the first version if it adds much scope.
   - **Extra layers**: If the existing UI has placeholders for “Ocean Waves”, “Solfeggio”, “Brown Noise”, “Binaural”, you can implement one or two as real layers (e.g. short looped samples or generated tones) with their own sliders; otherwise, focus on Voice + Music only and leave the rest as “Coming later” or remove from the first version.

---

## UX and copy (British English)

- **Page/entry**: Either integrate the mixer into the existing **Audio Studio** page (`/dashboard/audio/new`) so that after “Generate Voice Track” the user sees the mixer and “Export Final Mix (MP3)”, or add a dedicated route (e.g. `/dashboard/audio/mixer`) linked from the Audio section. The checklist says “Audio Mixer” so the feature must be discoverable (e.g. from the Audio list page or dashboard).
- **Labels**: e.g. “Voice level”, “Music level”, “Download mixed MP3”, “Play mix”, “Pause”. Short helper text where useful (e.g. “Adjust levels then play to preview. Download when ready.”).
- **Errors**: Clear messages (e.g. “Please generate or add a voice track first.”, “Please add a background music file.”). Use British spelling in messages.

---

## Technical constraints and patterns

- **Auth**: All API routes that handle uploads or generate exports must use Supabase server `createClient()` and return 401 if there is no user.
- **Files**: Voice can be in-memory (blob from TTS) or from storage. Music can be from file input (user upload) or a static asset. Prefer not storing mixed files on the server unless you add “Save to Audio list”.
- **No new DB tables required** for the minimal scope (voice + music, sliders, download). If you add “Save mixed track”, reuse the existing `audio_files` table and storage bucket.
- **Dependencies**: You may add a small client-side library for MP3 encoding (e.g. `lamejs`) or use a server-side mixer (e.g. `ffmpeg` via `fluent-ffmpeg` or a subprocess). Document what you add and why.

---

## Checklist before ticking off

- [ ] User can provide a voice track (generated on the page or uploaded) and a music track (upload or preset).
- [ ] Real-time level sliders for Voice and Music (and optionally 1–2 more layers); changing sliders updates playback without a separate “apply” step.
- [ ] Single “Play” (and Pause) plays the combined mix; seek/position and duration displayed where feasible.
- [ ] “Download mixed MP3” (or equivalent) produces one MP3 combining voice + music at current levels and triggers download.
- [ ] Audio Mixer is reachable from the dashboard (sidebar or Audio section) and described so users understand it (e.g. “Mix voice and music, download MP3”).
- [ ] All user-facing and error text in British English.
- [ ] Update `hypnobuddy-features-checklist.md`: tick **Audio Mixer** and adjust the “Still to build” line if needed.

---

## Summary one-liner

**Implement an in-app Audio Mixer: voice + background music with real-time level sliders and playback, plus download of the mixed result as a single MP3, using the existing Audio Studio / TTS flow where possible and British English throughout.**
