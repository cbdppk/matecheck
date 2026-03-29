"use client";

import { useRef, useState } from "react";

type Props = {
  text: string;
  label?: string;
};

export default function TtsButton({ text, label = "Hear in Twi" }: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stop() {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  }

  async function play() {
    if (loading || playing) return;
    stop();
    setLoading(true);
    setTtsError("");

    let audio: HTMLAudioElement | null = null;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json()) as { audio?: string; error?: string };

      if (!res.ok || !data.audio) {
        setTtsError("Audio not available");
        return;
      }

      audio = new Audio(data.audio);
      audio.onended = () => { setPlaying(false); audioRef.current = null; };
      audioRef.current = audio;

      // play() resolves when playback actually starts
      await audio.play();
      setPlaying(true);
    } catch {
      if (audio) { audio.onended = null; }
      audioRef.current = null;
      setPlaying(false);
      setTtsError("Couldn't play audio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={playing ? stop : () => void play()}
        disabled={loading}
        aria-label={playing ? `Stop ${label}` : label}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition",
          playing
            ? "bg-[#1E7A4A] text-white"
            : "bg-[#1E7A4A]/10 text-[#1E7A4A] hover:bg-[#1E7A4A]/20",
          loading ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {loading ? (
          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        )}
        {loading ? "Loading…" : playing ? "Stop" : label}
      </button>
      {ttsError ? <p className="text-[10px] text-slate-400">{ttsError}</p> : null}
    </div>
  );
}
