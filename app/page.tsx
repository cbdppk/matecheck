import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8]">

      {/* Green hero */}
      <div className="bg-[#1A6B41] flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-[20px] bg-white/15 flex items-center justify-center mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H7v-2h3v2zm0-4H7V9h3v2zm7 4h-5v-2h5v2zm0-4h-5V9h5v2z" />
          </svg>
        </div>

        <h1 className="text-[32px] font-bold text-white leading-tight tracking-tight">
          MateCheck
        </h1>
        <p className="text-[14px] text-white/70 mt-2 max-w-[280px] leading-relaxed">
          Trotro revenue tracking — simple, fast, and built for Ghana
        </p>
      </div>

      {/* Role selection */}
      <div className="flex-1 px-5 pt-8 pb-10 space-y-4">
        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 text-center mb-6">
          Choose your role
        </p>

        {/* Driver card */}
        <Link
          href="/driver"
          className="flex items-center gap-4 bg-white rounded-[20px] px-5 py-5 border border-slate-100 shadow-sm active:bg-slate-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-[14px] bg-[#1A6B41] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 6h10.29l1.08 3.11H5.77L6.85 6zM19 17H5v-6h14v6zM7.5 14c-.83 0-1.5-.67-1.5-1.5S6.67 11 7.5 11s1.5.67 1.5 1.5S8.33 14 7.5 14zm9 0c-.83 0-1.5-.67-1.5-1.5S15.67 11 16.5 11s1.5.67 1.5 1.5S17.33 14 16.5 14z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-slate-900">I&apos;m a Driver / Mate</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Log trip sales and track earnings</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#CBD5E1" aria-hidden="true"
            className="flex-shrink-0 group-active:fill-[#1A6B41] transition-colors">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </Link>

        {/* Owner card */}
        <Link
          href="/owner"
          className="flex items-center gap-4 bg-white rounded-[20px] px-5 py-5 border border-slate-100 shadow-sm active:bg-slate-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-[14px] bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h11v2H3v-2zm0 4h11v2H3v-2zm13-1l5 5-5 5v-3h-4v-4h4v-3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-slate-900">I&apos;m an Owner</p>
            <p className="text-[12px] text-slate-400 mt-0.5">View fleet revenue and summaries</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#CBD5E1" aria-hidden="true"
            className="flex-shrink-0 group-active:fill-slate-700 transition-colors">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </Link>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-300 pt-4">
          Cursor Hackathon Ghana · 2026
        </p>
      </div>
    </div>
  );
}
