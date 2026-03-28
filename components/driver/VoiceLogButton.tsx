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

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type Props = {
  onResult: (text: string) => void;
  onError: (message: string) => void;
};

export default function VoiceLogButton({ onResult, onError }: Props) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function startRecording() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      onError(event.error || "Microphone error");
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      className="relative flex min-h-32 w-full flex-col items-center justify-center rounded-[28px] bg-brand px-4 py-6 text-white shadow-soft"
    >
      {recording ? (
        <span className="absolute inline-flex h-24 w-24 animate-ping rounded-full bg-white/20" />
      ) : null}

      <span className="relative text-lg font-semibold">
        {recording ? "Listening..." : "Tap to speak"}
      </span>
      <span className="relative mt-2 text-sm text-white/85">Kasa</span>
    </button>
  );
}
