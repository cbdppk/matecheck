"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const logsActive = pathname === "/driver/logs";
  const todayActive = pathname === "/driver";

  return (
    <div className="sticky bottom-0 z-20 md:hidden flex items-center justify-around pb-6 pt-3 bg-white border-t border-slate-100 shadow-sm">

      {/* Today — driver log screen */}
      <Link
        href="/driver"
        aria-label="Today's trips"
        className="flex flex-col items-center gap-1 min-w-[60px] active:opacity-70 active:scale-[0.97] transition-transform"
      >
        <svg width="22" height="22" viewBox="0 0 24 24"
          fill={todayActive ? "#1E7A4A" : "#94A3B8"} aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        <span className={`text-[10px] font-semibold ${todayActive ? "text-[#1E7A4A]" : "text-slate-400"}`}>
          Today
        </span>
      </Link>

      {/* Trip logs — /driver/logs */}
      <Link
        href="/driver/logs"
        aria-label="All trip logs"
        className="flex flex-col items-center gap-1 min-w-[60px] active:opacity-70 active:scale-[0.97] transition-transform"
      >
        <svg width="22" height="22" viewBox="0 0 24 24"
          fill={logsActive ? "#1E7A4A" : "#94A3B8"} aria-hidden="true">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
        <span className={`text-[10px] font-semibold ${logsActive ? "text-[#1E7A4A]" : "text-slate-400"}`}>
          Logs
        </span>
      </Link>

    </div>
  );
}
