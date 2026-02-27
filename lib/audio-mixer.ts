/**
 * Client-side audio mixer: decode voice + music, mix with gains, then encode to MP3 using lamejs.
 * British English in user-facing strings is handled in the UI.
 */

const SAMPLE_RATE = 44100;
const MP3_KBPS = 128;
const ENCODE_BLOCK = 1152;

export type MixerSource = { url: string } | { blob: Blob };

/**
 * Decode one audio source (URL or Blob) to Float32Array[] (channels).
 */
async function decodeToBuffer(
  ctx: AudioContext,
  source: MixerSource
): Promise<{ left: Float32Array; right: Float32Array; length: number }> {
  const arrayBuffer =
    "url" in source
      ? await fetch(source.url).then((r) => r.arrayBuffer())
      : await source.blob.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const left =
    numChannels >= 1 ? audioBuffer.getChannelData(0) : new Float32Array(length);
  const right =
    numChannels >= 2
      ? audioBuffer.getChannelData(1)
      : left.slice(0);
  return { left, right, length };
}

/**
 * Mix voice and music at given gains (0–1), length = max of both.
 * Returns interleaved stereo Float32 (L,R,L,R,...) for lamejs.
 */
function mix(
  voice: { left: Float32Array; right: Float32Array; length: number },
  music: { left: Float32Array; right: Float32Array; length: number },
  voiceGain: number,
  musicGain: number
): Float32Array {
  const len = Math.max(voice.length, music.length);
  const out = new Float32Array(len * 2);
  for (let i = 0; i < len; i++) {
    const vL = i < voice.length ? voice.left[i] * voiceGain : 0;
    const vR = i < voice.length ? voice.right[i] * voiceGain : 0;
    const mL = i < music.length ? music.left[i] * musicGain : 0;
    const mR = i < music.length ? music.right[i] * musicGain : 0;
    out[i * 2] = vL + mL;
    out[i * 2 + 1] = vR + mR;
  }
  return out;
}

/**
 * Normalise and convert stereo Float32 to Int16 for lamejs (encodeBuffer takes left, right Int16).
 */
function floatToInt16Stereo(
  interleaved: Float32Array
): { left: Int16Array; right: Int16Array } {
  const n = interleaved.length / 2;
  const left = new Int16Array(n);
  const right = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, interleaved[i * 2]));
    const r = Math.max(-1, Math.min(1, interleaved[i * 2 + 1]));
    left[i] = l < 0 ? l * 0x8000 : l * 0x7fff;
    right[i] = r < 0 ? r * 0x8000 : r * 0x7fff;
  }
  return { left, right };
}

/**
 * Encode mixed stereo PCM to MP3 and return a Blob.
 */
interface LameMp3Encoder {
  encodeBuffer(left: Int16Array, right: Int16Array): Int8Array;
  flush(): Int8Array;
}

function encodeToMp3(
  left: Int16Array,
  right: Int16Array,
  sampleRate: number = SAMPLE_RATE
): Blob {
  const lamejs = require("lamejs") as { Mp3Encoder: new (ch: number, sr: number, kbps: number) => LameMp3Encoder };
  const encoder = new lamejs.Mp3Encoder(2, sampleRate, MP3_KBPS);
  const mp3Chunks: Int8Array[] = [];
  for (let i = 0; i < left.length; i += ENCODE_BLOCK) {
    const end = Math.min(i + ENCODE_BLOCK, left.length);
    const chunkL = left.subarray(i, end);
    const chunkR = right.subarray(i, end);
    const block = encoder.encodeBuffer(chunkL, chunkR);
    if (block.length > 0) mp3Chunks.push(block);
  }
  const last = encoder.flush();
  if (last.length > 0) mp3Chunks.push(last);
  const totalLength = mp3Chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of mp3Chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return new Blob([result], { type: "audio/mpeg" });
}

/**
 * Mix voice and music at given gains and return an MP3 Blob.
 * Voice/music can be object URL or Blob. Gains 0–1.
 */
export async function mixAndExportMp3(
  voiceSource: MixerSource,
  musicSource: MixerSource,
  voiceGain: number,
  musicGain: number
): Promise<Blob> {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const [voice, music] = await Promise.all([
    decodeToBuffer(ctx, voiceSource),
    decodeToBuffer(ctx, musicSource),
  ]);
  const interleaved = mix(voice, music, voiceGain, musicGain);
  const { left, right } = floatToInt16Stereo(interleaved);
  return encodeToMp3(left, right, SAMPLE_RATE);
}
