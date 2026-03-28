"use client";

import { useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface MicButtonProps {
  onResult: (text: string) => void;
  onError: (message: string) => void;
  variant?: "mobile" | "desktop";
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 3.06-3.1 5.41-6.41 5.41S5.58 14.06 5.09 11H3.07c.51 3.49 3.16 6.26 6.43 6.89V21h2.5v-3.11c3.27-.63 5.92-3.4 6.43-6.89h-2.02z" />
    </svg>
  );
}

export default function MicButton({ onResult, onError, variant = "mobile" }: MicButtonProps) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function toggle() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Recognition = (window as any).SpeechRecognition as (new () => SpeechRecognitionLike) | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (window as any).webkitSpeechRecognition as (new () => SpeechRecognitionLike) | undefined;

    if (!Recognition) {
      onError("Speech recognition is not supported on this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ak";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(event.error || "Microphone error");
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  if (variant === "desktop") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`w-full rounded-2xl px-6 py-6 flex items-center gap-5 cursor-pointer transition-colors ${
          recording ? "bg-[#155C37]" : "bg-[#1E7A4A] active:bg-[#155C37]"
        }`}
      >
        <div className="relative w-[52px] h-[52px] rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
          {recording && (
            <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
          )}
          <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
            <MicIcon size={18} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {recording ? "Listening…" : "Tap to speak"}
          </span>
          <span className="text-xs text-white/60 mt-0.5">
            Kasa — say route and amount in Twi
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`w-full rounded-2xl px-5 py-7 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
        recording ? "bg-[#155C37]" : "bg-[#1E7A4A] active:bg-[#155C37]"
      }`}
    >
      <div className="relative w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
        {recording && (
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        )}
        <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center">
          <MicIcon size={20} />
        </div>
      </div>
      <span className="text-[15px] font-semibold text-white">
        {recording ? "Listening…" : "Tap to speak"}
      </span>
      <span className="text-xs text-white/60">Kasa — say route and amount in Twi</span>
    </button>
  );
}
