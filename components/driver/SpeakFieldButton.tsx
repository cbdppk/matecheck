"use client";

import { useState } from "react";
import { useWavRecorder } from "@/lib/useWavRecorder";

type Field = "route" | "amount";

type Props = {
  field: Field;
  onResult: (value: string) => void;
  onError: (message: string) => void;
};

type UIState = "idle" | "recording" | "transcribing";

const config: Record<Field, { idle: string; recording: string; transcribing: string; sublabel: string }> = {
  route: {
    idle: "Speak route",
    recording: "Listening...",
    transcribing: "Recognising...",
    sublabel: "Kasa kwan no",
  },
  amount: {
    idle: "Speak amount",
    recording: "Listening...",
    transcribing: "Recognising...",
    sublabel: "Kasa sika no",
  },
};

export default function SpeakFieldButton({ field, onResult, onError }: Props) {
  const [uiState, setUiState] = useState<UIState>("idle");
  const { start, stop } = useWavRecorder();

  async function startRecording() {
    try {
      await start();
      setUiState("recording");
    } catch {
      onError("Could not access microphone.");
    }
  }

  async function stopRecording() {
    const wavBlob = stop();
    setUiState("transcribing");

    try {
      // Step 1: ASR — audio → raw transcript
      const form = new FormData();
      form.append("file", wavBlob, "audio.wav");
      const asrRes = await fetch("/api/transcribe", { method: "POST", body: form });
      const asrData = (await asrRes.json()) as { transcript?: string; error?: string };
      if (asrData.error) throw new Error(asrData.error);
      const transcript = asrData.transcript ?? "";

      // Step 2: Focused parse — only extract the field we care about
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript, field }),
      });
      const parsed = (await parseRes.json()) as {
        route?: string;
        amount?: number;
        error?: string;
      };
      if (parsed.error) throw new Error(parsed.error);

      if (field === "route") {
        onResult(parsed.route ?? transcript);
      } else {
        onResult(parsed.amount != null ? String(parsed.amount) : "");
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Recognition failed");
    } finally {
      setUiState("idle");
    }
  }

  const cfg = config[field];

  const label =
    uiState === "recording" ? cfg.recording :
    uiState === "transcribing" ? cfg.transcribing :
    cfg.idle;

  return (
    <button
      type="button"
      onClick={uiState === "idle" ? startRecording : uiState === "recording" ? stopRecording : undefined}
      disabled={uiState === "transcribing"}
      className={`relative flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
        uiState === "recording"
          ? "bg-red-100 text-red-700 ring-2 ring-red-300"
          : "bg-brand/10 text-brand hover:bg-brand/20"
      }`}
    >
      {uiState === "recording" ? (
        <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-red-400" />
      ) : (
        <span className="text-base">🎙</span>
      )}
      <span>{label}</span>
      {uiState === "idle" ? (
        <span className="ml-1 text-xs font-normal text-gray-400">{cfg.sublabel}</span>
      ) : null}
    </button>
  );
}
