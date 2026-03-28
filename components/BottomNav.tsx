"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const logsActive = pathname === "/driver/logs";

  return (
    <div className="sticky bottom-0 z-20 md:hidden flex items-center justify-center pb-6 bg-transparent">
      {/* Left pill — Trip logs */}
      <Link
        href="/driver/logs"
        aria-label="Open all trip logs"
        className="bg-white border border-slate-100 shadow-md h-[50px] w-[110px] rounded-l-full -mr-3 flex items-center justify-center active:scale-[0.99] transition-transform"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={logsActive ? "#1E7A4A" : "#94A3B8"}
          aria-hidden="true"
        >
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
      </Link>

      {/* Center FAB */}
      <Link
        href="/log-trip"
        aria-label="Log new trip"
        className="w-[60px] h-[60px] rounded-full bg-[#155C37] z-10 shadow-[0_5px_18px_rgba(21,92,55,0.45)] active:scale-95 transition-transform flex items-center justify-center flex-shrink-0"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </Link>

      {/* Right pill — Profile (inactive) */}
      <div className="bg-white border border-slate-100 shadow-md h-[50px] w-[110px] rounded-r-full -ml-3 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    </div>
  );
}
