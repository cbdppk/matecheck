import Link from "next/link";

export default function BottomNav() {
  return (
    <div className="sticky bottom-0 z-20 md:hidden flex items-center justify-around pb-6 pt-3 bg-white border-t border-slate-100 shadow-sm">
      {/* Trips */}
      <Link
        href="/driver"
        className="flex flex-col items-center gap-1 min-w-[60px] active:opacity-70"
        aria-label="Trip logs"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E7A4A" aria-hidden="true">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
        <span className="text-[10px] font-semibold text-[#1E7A4A]">Trips</span>
      </Link>

      {/* Owner */}
      <Link
        href="/owner"
        className="flex flex-col items-center gap-1 min-w-[60px] active:opacity-70"
        aria-label="Owner dashboard"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
          <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
        </svg>
        <span className="text-[10px] font-medium text-slate-400">Owner</span>
      </Link>

      {/* Profile */}
      <Link
        href="/driver#profile"
        className="flex flex-col items-center gap-1 min-w-[60px] active:opacity-70"
        aria-label="Profile"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="text-[10px] font-medium text-slate-400">Profile</span>
      </Link>
    </div>
  );
}
