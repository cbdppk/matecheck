"use client";

import { useState, useRef, useEffect } from "react";
import { useWavRecorder } from "@/lib/useWavRecorder";

type Field = "route" | "amount";

type Props = {
  field: Field;
  value: string;
  onValueChange: (value: string) => void;
  onError: (message: string) => void;
};

const MAX_SECONDS = 30;

const FIELD_CONFIG = {
  route: {
    title: "Route",
    placeholder: "e.g. Santase – Adum",
    twi: "Kasa kwan no",
    inputMode: undefined as undefined,
    inputType: "text" as const,
  },
  amount: {
    title: "Trip Sales (GHS)",
    placeholder: "e.g. 80",
    twi: "Kasa sika no",
    inputMode: "decimal" as const,
    inputType: "number" as const,
  },
};

export default function SpeakFieldButton({ field, value, onValueChange, onError }: Props) {
  const [uiState, setUiState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [preview, setPreview] = useState("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const { start, stop } = useWavRecorder();
  const cfg = FIELD_CONFIG[field];

  function clearTimers() {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    if (autoStopRef.current)  { clearTimeout(autoStopRef.current);   autoStopRef.current  = null; }
  }

  async function handleStop() {
    clearTimers();
    const wavBlob = stop();
    setUiState("transcribing");

    try {
      const form = new FormData();
      form.append("file", wavBlob, "audio.wav");
      const asrRes  = await fetch("/api/transcribe", { method: "POST", body: form });
      const asrData = (await asrRes.json()) as { transcript?: string; error?: string };
      if (asrData.error) throw new Error(asrData.error);

      const raw = asrData.transcript ?? "";
      setPreview(raw);

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw, field }),
      });
      const parsed = (await parseRes.json()) as { route?: string; amount?: number; error?: string };
      if (parsed.error) throw new Error(parsed.error);

      onValueChange(
        field === "route"
          ? (parsed.route ?? raw)
          : parsed.amount != null ? String(parsed.amount) : "",
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : "Recognition failed");
    } finally {
      setUiState("idle");
      setPreview("");
    }
  }

  async function handleStart() {
    try {
      await start();
      setUiState("recording");
      setSecondsLeft(MAX_SECONDS);
      setPreview("");

      countdownRef.current = setInterval(() => {
        setSecondsLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      autoStopRef.current = setTimeout(() => {
        void handleStop();
      }, MAX_SECONDS * 1000);
    } catch {
      onError("Microphone access denied.");
    }
  }

  // cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  const busy = uiState !== "idle";

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* ── Large mic button ─────────────────────────────────── */}
      <button
        type="button"
        onClick={uiState === "idle" ? handleStart : uiState === "recording" ? handleStop : undefined}
        disabled={uiState === "transcribing"}
        aria-label={uiState === "idle" ? `Tap to record ${cfg.title}` : "Stop recording"}
        className={[
          "w-[72px] h-[72px] rounded-full flex items-center justify-center",
          "transition-all duration-200 active:scale-[0.93] select-none",
          "disabled:opacity-40",
          uiState === "recording"
            ? "bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.14)]"
            : uiState === "transcribing"
            ? "bg-slate-100"
            : "bg-[#1E7A4A] shadow-[0_8px_24px_rgba(30,122,74,0.38)]",
        ].join(" ")}
      >
        {uiState === "recording" ? (
          /* Stop icon — pulsing white circle */
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-white" />
          </span>
        ) : uiState === "transcribing" ? (
          /* Spinner */
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="#94A3B8" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.18" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2C10.34 2 9 3.34 9 5v6c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      {/* ── Status / transcript preview ───────────────────────── */}
      <div className="min-h-[36px] w-full flex flex-col items-center justify-center gap-0.5 px-1">
        {uiState === "recording" ? (
          <>
            <p className="text-xs font-semibold text-red-500">Listening… {secondsLeft}s</p>
            <p className="text-[10px] text-slate-400">Tap circle to stop early</p>
          </>
        ) : uiState === "transcribing" ? (
          <>
            <p className="text-xs font-semibold text-blue-500">Recognising…</p>
            {preview ? (
              <p className="text-[10px] text-slate-400 truncate w-full text-center px-2">
                &ldquo;{preview}&rdquo;
              </p>
            ) : null}
          </>
        ) : value ? (
          <p className="text-xs font-semibold text-green-700 truncate w-full text-center px-2">
            {field === "amount" ? `GHS ${value}` : value}
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-400">Tap to speak</p>
            <p className="text-[10px] text-slate-300">{cfg.twi}</p>
          </>
        )}
      </div>

      {/* ── Manual text input ─────────────────────────────────── */}
      <div className="w-full relative">
        <input
          type={cfg.inputType}
          inputMode={cfg.inputMode}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={cfg.placeholder}
          disabled={busy}
          className={[
            "w-full rounded-2xl px-4 py-3.5 text-sm text-slate-900 text-center",
            "placeholder:text-slate-300 outline-none transition-colors border",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value
              ? "bg-green-50 border-green-300 font-semibold text-green-900 focus:border-green-400"
              : "bg-white border-slate-200 focus:border-[#1E7A4A] focus:ring-2 focus:ring-[#1E7A4A]/10",
          ].join(" ")}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear"
            disabled={busy}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center disabled:hidden"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#64748B" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
