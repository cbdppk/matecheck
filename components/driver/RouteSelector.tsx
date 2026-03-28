"use client";

import { useState, useRef, useEffect } from "react";
import { useWavRecorder } from "@/lib/useWavRecorder";
import { KNOWN_ROUTES } from "@/lib/knownRoutes";

const CUSTOM_KEY = "__custom__";
const MAX_SECONDS = 30;

type Props = {
  value: string;
  onChange: (value: string) => void;
  defaultRoute?: string;
  disabled?: boolean;
};

export default function RouteSelector({ value, onChange, defaultRoute, disabled }: Props) {
  // Determine if current value is a known route or custom text
  const isKnown = value !== "" && KNOWN_ROUTES.includes(value);
  const isCustom = value !== "" && !isKnown;
  const selectValue = value === "" ? "" : isCustom ? CUSTOM_KEY : value;

  const [showCustomInput, setShowCustomInput] = useState(isCustom);
  const [uiState, setUiState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [preview, setPreview] = useState("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const { start, stop } = useWavRecorder();

  // Sync showCustomInput when value changes externally (e.g., cleared after save)
  useEffect(() => {
    const custom = value !== "" && !KNOWN_ROUTES.includes(value);
    setShowCustomInput(custom);
  }, [value]);

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
        body: JSON.stringify({ text: raw, field: "route" }),
      });
      const parsed = (await parseRes.json()) as { route?: string; error?: string };
      const result = parsed.route ?? raw;

      // If voice result matches a known route, pick it from dropdown
      const matched = KNOWN_ROUTES.find(
        r => r.toLowerCase() === result.toLowerCase()
      );
      if (matched) {
        setShowCustomInput(false);
        onChange(matched);
      } else {
        setShowCustomInput(true);
        onChange(result);
      }
    } catch {
      // silent — user can type manually
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
      autoStopRef.current = setTimeout(() => void handleStop(), MAX_SECONDS * 1000);
    } catch {
      // mic denied — user types manually
    }
  }

  useEffect(() => () => clearTimers(), []);

  const busy = uiState !== "idle" || !!disabled;

  // Build option list: default route first (if set), then all known routes (deduped)
  const options: string[] = defaultRoute
    ? [defaultRoute, ...KNOWN_ROUTES.filter(r => r !== defaultRoute)]
    : KNOWN_ROUTES;

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* ── Mic button ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={uiState === "idle" ? handleStart : uiState === "recording" ? handleStop : undefined}
        disabled={busy && uiState === "idle"}
        aria-label={uiState === "idle" ? "Tap to record route" : "Stop recording"}
        className={[
          "w-[72px] h-[72px] rounded-full flex items-center justify-center",
          "transition-all duration-200 active:scale-[0.93] select-none",
          uiState === "recording"
            ? "bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.14)]"
            : uiState === "transcribing"
            ? "bg-slate-100"
            : "bg-[#1A6B41] shadow-[0_8px_24px_rgba(26,107,65,0.38)]",
          busy && uiState === "idle" ? "opacity-40" : "",
        ].join(" ")}
      >
        {uiState === "recording" ? (
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-white" />
          </span>
        ) : uiState === "transcribing" ? (
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="#94A3B8" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.18" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2C10.34 2 9 3.34 9 5v6c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      {/* ── Status text ───────────────────────────────────────── */}
      <div className="min-h-[36px] w-full flex flex-col items-center justify-center gap-0.5 px-1">
        {uiState === "recording" ? (
          <>
            <p className="text-xs font-semibold text-red-500">Listening… {secondsLeft}s</p>
            <p className="text-[10px] text-slate-400">Tap circle to stop</p>
          </>
        ) : uiState === "transcribing" ? (
          <>
            <p className="text-xs font-semibold text-blue-500">Recognising…</p>
            {preview ? <p className="text-[10px] text-slate-400 truncate w-full text-center">&ldquo;{preview}&rdquo;</p> : null}
          </>
        ) : value ? (
          <p className="text-[11px] font-semibold text-green-700 truncate w-full text-center px-2">{value}</p>
        ) : (
          <>
            <p className="text-xs text-slate-400">Tap to speak</p>
            <p className="text-[10px] text-slate-300">Kasa kwan no</p>
          </>
        )}
      </div>

      {/* ── Route dropdown ────────────────────────────────────── */}
      <div className="w-full space-y-1.5">
        <div className="relative">
          <select
            value={selectValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === CUSTOM_KEY) {
                setShowCustomInput(true);
                onChange("");
              } else {
                setShowCustomInput(false);
                onChange(v);
              }
            }}
            disabled={busy}
            className={[
              "w-full appearance-none rounded-2xl border px-4 py-3.5 pr-9",
              "text-[12px] leading-tight outline-none transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value && !isCustom
                ? "bg-green-50 border-green-300 font-semibold text-green-900"
                : "bg-white border-slate-200 text-slate-700 focus:border-[#1A6B41] focus:ring-2 focus:ring-[#1A6B41]/10",
            ].join(" ")}
          >
            <option value="" disabled>Select route…</option>
            {options.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
            <option value={CUSTOM_KEY}>— Type custom route —</option>
          </select>
          {/* Chevron icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </div>

        {/* Custom text input — shown when "Type custom route" selected or voice returned unknown */}
        {showCustomInput ? (
          <div className="relative">
            <input
              type="text"
              value={isCustom ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. Santase – Bomso"
              disabled={busy}
              autoFocus
              className={[
                "w-full rounded-2xl border px-4 py-3 text-[12px] leading-tight",
                "outline-none transition-colors",
                "placeholder:text-slate-300 disabled:opacity-50",
                isCustom && value
                  ? "bg-green-50 border-green-300 font-semibold text-green-900"
                  : "bg-white border-slate-200 focus:border-[#1A6B41] focus:ring-2 focus:ring-[#1A6B41]/10 text-slate-900",
              ].join(" ")}
            />
            {isCustom && value ? (
              <button
                type="button"
                onClick={() => { onChange(""); }}
                aria-label="Clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#64748B" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
