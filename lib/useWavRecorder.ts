"use client";

import { useRef, useState } from "react";

const SAMPLE_RATE = 16000;

export type RecordState = "idle" | "recording";

/** Encodes collected PCM chunks into a 16-bit mono WAV Blob. */
function encodeWav(chunks: Float32Array[]): Blob {
  const totalLen = chunks.reduce((n, c) => n + c.length, 0);
  const pcm = new Float32Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) { pcm.set(chunk, offset); offset += chunk.length; }

  const numSamples = pcm.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

  str(0, "RIFF"); view.setUint32(4, 36 + numSamples * 2, true);
  str(8, "WAVE"); str(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true); view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  str(36, "data"); view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Shared hook for Web Audio API recording → WAV blob.
 * Components call start() to begin, stop() to get the WAV blob.
 */
export function useWavRecorder() {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<(AudioNode & { _stream?: MediaStream }) | null>(null);

  async function start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
    audioCtxRef.current = ctx;
    pcmChunksRef.current = [];

    const source = ctx.createMediaStreamSource(stream);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      pcmChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(ctx.destination);
    (processor as unknown as { _stream: MediaStream })._stream = stream;
    processorRef.current = processor as unknown as AudioNode & { _stream?: MediaStream };
    setRecordState("recording");
  }

  function stop(): Blob {
    const processor = processorRef.current;
    if (processor) {
      (processor as AudioNode).disconnect();
      processor._stream?.getTracks().forEach((t) => t.stop());
    }
    audioCtxRef.current?.close();
    setRecordState("idle");
    return encodeWav(pcmChunksRef.current);
  }

  return { recordState, start, stop };
}
