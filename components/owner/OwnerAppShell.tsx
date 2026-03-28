"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

export default function OwnerAppShell({ children }: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const onOwnerRoutes = pathname.startsWith("/owner");
  const fleetTabActive = onOwnerRoutes;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">
        <div className="pb-28">{children}</div>

        <nav
          aria-label="Owner navigation"
          className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex h-16 max-w-md items-center justify-around border-t border-slate-100 bg-white px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/owner"
            aria-current={fleetTabActive ? "page" : undefined}
            className="flex flex-col items-center gap-1"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={fleetTabActive ? "#1E7A4A" : "#94A3B8"}
              aria-hidden
            >
              <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h11v2H3v-2zm0 4h11v2H3v-2zm13-1l5 5-5 5v-3h-4v-4h4v-3z" />
            </svg>
            <span
              className={`text-[10px] font-semibold ${fleetTabActive ? "text-[#1E7A4A]" : "text-slate-400"}`}
            >
              Fleet
            </span>
          </Link>

          <Link href="/" className="flex flex-col items-center gap-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-400">Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Owner profile"
            className="flex flex-col items-center gap-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-400">Profile</span>
          </button>
        </nav>

        {profileOpen ? (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <button
              type="button"
              aria-label="Close profile"
              className="absolute inset-0 bg-black/40"
              onClick={() => setProfileOpen(false)}
            />
            <div className="relative z-10 rounded-t-[28px] bg-white px-5 pb-10 pt-5">
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Owner console
              </p>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#1E7A4A]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Fleet owner</p>
                  <p className="text-sm text-slate-500">MateCheck revenue visibility</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/owner"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Fleet dashboard
                  <span className="text-slate-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
