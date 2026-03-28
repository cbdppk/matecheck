"use client";

import { useState } from "react";
import { useWavRecorder } from "@/lib/useWavRecorder";

type Props = {
  onResult: (text: string) => void;
  onError: (message: string) => void;
};

type UIState = "idle" | "recording" | "transcribing";

export default function VoiceLogButton({ onResult, onError }: Props) {
  const [uiState, setUiState] = useState<UIState>("idle");
  const { recordState, start, stop } = useWavRecorder();

  async function startRecording() {
    try {
      await start();
      setUiState("recording");
    } catch {
      onError("Could not access microphone. Please allow microphone permission.");
    }
  }

  async function stopRecording() {
    const wavBlob = stop();
    setUiState("transcribing");

    try {
      const form = new FormData();
      form.append("file", wavBlob, "audio.wav");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json()) as { transcript?: string; error?: string };
      if (data.error) throw new Error(data.error);
      onResult(data.transcript ?? "");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Transcription failed");
    } finally {
      setUiState("idle");
    }
  }

  void recordState; // used by hook internally

  const label =
    uiState === "recording" ? "Listening... tap to stop" :
    uiState === "transcribing" ? "Transcribing..." :
    "Tap to speak";

  const sublabel =
    uiState === "recording" ? "Kasa..." :
    uiState === "transcribing" ? "Twetwe..." :
    "Kasa";

  return (
    <button
      type="button"
      onClick={uiState === "idle" ? startRecording : uiState === "recording" ? stopRecording : undefined}
      disabled={uiState === "transcribing"}
      className="relative flex min-h-32 w-full flex-col items-center justify-center rounded-[28px] bg-brand px-4 py-6 text-white shadow-soft disabled:opacity-70"
    >
      {uiState === "recording" ? (
        <span className="absolute inline-flex h-24 w-24 animate-ping rounded-full bg-white/20" />
      ) : null}
      <span className="relative text-lg font-semibold">{label}</span>
      <span className="relative mt-2 text-sm text-white/85">{sublabel}</span>
    </button>
  );
}
