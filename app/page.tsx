import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-[#1E7A4A] font-bold text-lg tracking-tight leading-none">MateCheck</p>
            <p className="hidden sm:block text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide">
              Trotro revenue intelligence
            </p>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/driver"
              className="bg-[#1E7A4A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#155C37] transition min-h-[36px] flex items-center"
            >
              I&apos;m a Driver
            </Link>
            <Link
              href="/owner"
              className="border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-50 transition min-h-[36px] flex items-center"
            >
              I&apos;m an Owner
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="bg-[#1E7A4A] relative overflow-hidden min-h-[480px] md:min-h-[560px]">
        {/* Trotro photo — right half, desktop only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trotro.jpg"
          alt="Trotro buses at an Accra station"
          className="hidden md:block absolute inset-y-0 right-0 w-[55%] h-full object-cover object-center"
        />

        {/* Gradient: solid green on left → transparent on right, covers the photo seam */}
        <div
          className="hidden md:block absolute inset-y-0 right-0 w-[55%] pointer-events-none"
          aria-hidden="true"
          style={{ background: "linear-gradient(to right, #1E7A4A 0%, #1E7A4A 18%, rgba(30,122,74,0.85) 38%, rgba(30,122,74,0.3) 65%, transparent 100%)" }}
        />

        {/* Mobile-only subtle decorative circles (no photo on mobile) */}
        <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5" />
        </div>

        {/* Text content */}
        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24 md:w-[52%]">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-4">
            Built for Ghana&apos;s trotro economy
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Track every trip.<br />Trust the numbers.
          </h1>

          <p className="mt-5 text-base md:text-lg text-white/80 max-w-lg leading-relaxed">
            MateCheck turns untracked cash collections into AI-verified trip logs — voice logging in Twi, real-time dashboards, and dispute resolution that speaks your language.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/driver"
              className="bg-white text-[#1E7A4A] font-bold text-base px-7 py-4 rounded-2xl hover:bg-white/90 transition text-center min-h-[56px] flex items-center justify-center"
            >
              I&apos;m a Driver — Log trips
            </Link>
            <Link
              href="/owner"
              className="bg-white/15 border border-white/20 text-white font-bold text-base px-7 py-4 rounded-2xl hover:bg-white/20 transition text-center min-h-[56px] flex items-center justify-center"
            >
              I&apos;m an Owner — See earnings
            </Link>
          </div>

          {/* Context pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["6 trips logged today", "GHS 120 earned", "AI verified ✓", "Speaks Twi"].map(
              (pill) => (
                <span
                  key={pill}
                  className="bg-white/10 text-white/75 text-xs font-medium px-3.5 py-1.5 rounded-full"
                >
                  {pill}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="bg-white py-16 md:py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1E7A4A] text-center mb-3">
            Why it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center leading-tight max-w-2xl mx-auto">
            Everything the trotro economy has been missing.
          </h2>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {/* ---- Driver column ---- */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="bg-[#1E7A4A] px-6 py-5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-1">
                  For Drivers
                </p>
                <p className="text-lg font-bold text-white leading-snug">
                  Log trips in seconds, not minutes
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    Log trips in Twi, hands-free
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Tap the mic and say the route and amount in Twi. Claude AI parses the speech
                    and logs the trip in seconds — no typing, no forms.
                  </p>
                  <p className="mt-2.5 text-xs font-semibold text-[#1E7A4A]">
                    Kasa — speaks back a confirmation in Twi via GhanaNLP TTS
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    Every trip gets a confidence score
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Each log is rated High, Medium, or Low confidence based on how clearly AI
                    understood the voice input. A colour dot on every card means nothing is ever
                    silently wrong.
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <span className="text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] px-2.5 py-0.5 rounded-full">
                      High
                    </span>
                    <span className="text-[11px] font-semibold bg-[#FEF9C3] text-[#854D0E] px-2.5 py-0.5 rounded-full">
                      Medium
                    </span>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    Works even when the network is slow
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    If voice recognition is unavailable the text fallback kicks in automatically.
                    The screen is never empty — sample data is always present so the demo never
                    fails.
                  </p>
                </div>
              </div>
            </div>

            {/* ---- Owner column ---- */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="bg-[#0F172A] px-6 py-5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-1">
                  For Owners
                </p>
                <p className="text-lg font-bold text-white leading-snug">
                  Know your numbers before the driver calls
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    Real-time earnings dashboard
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    See every vehicle&apos;s daily total the moment a trip is logged. Trip count,
                    average per trip, and a 7-day earnings bar chart — all in one view, for
                    every vehicle you own.
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    Anomaly detection, automatic
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    If a vehicle earns more than 30% below its 7-day average a red flag appears
                    instantly. No manual checking. No end-of-day surprise.
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900 mb-1.5">
                    AI dispute resolution — in Twi and English
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    When earnings don&apos;t add up, type the dispute in plain language. Claude
                    reviews every trip log and returns a neutral verdict with analysis in both
                    Twi and English.
                  </p>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    <span className="text-[11px] font-semibold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                      Match ✓
                    </span>
                    <span className="text-[11px] font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full">
                      Gap — explained
                    </span>
                    <span className="text-[11px] font-semibold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                      Gap — unexplained
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ROLE ENTRY CARDS ===== */}
      <section className="bg-[#F8FAFC] py-16 md:py-20 px-5 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2">
            Who are you here as?
          </h2>
          <p className="text-sm text-slate-400 text-center mb-10">
            Pick your role to get started
          </p>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Driver card */}
            <div className="bg-white rounded-2xl border-l-4 border-l-[#1E7A4A] border border-slate-100 shadow-sm p-6 flex flex-col">
              <div className="w-11 h-11 rounded-full bg-[#1E7A4A]/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1E7A4A" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">I&apos;m a Driver</p>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                Log trips by voice in Twi. See what you&apos;ve earned today. Get an AI-spoken
                confirmation after every trip.
              </p>
              <Link
                href="/driver"
                className="mt-5 bg-[#1E7A4A] text-white font-semibold text-sm px-5 py-3.5 rounded-xl text-center hover:bg-[#155C37] transition min-h-[48px] flex items-center justify-center"
              >
                Open Driver screen
              </Link>
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-2xl border-l-4 border-l-[#0F172A] border border-slate-100 shadow-sm p-6 flex flex-col">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F172A" aria-hidden="true">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-slate-900 mb-1">I&apos;m an Owner</p>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                See every trip your vehicles made today. Get AI-generated summaries. Resolve
                disputes with a single message — verdict in Twi and English.
              </p>
              <Link
                href="/owner"
                className="mt-5 border border-slate-200 text-slate-800 font-semibold text-sm px-5 py-3.5 rounded-xl text-center hover:bg-slate-50 transition min-h-[48px] flex items-center justify-center"
              >
                Open Owner dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1E7A4A] px-5 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">MateCheck</p>
            <p className="text-white/60 text-sm mt-0.5">Track. Trust. Get paid right.</p>
            <p className="text-white/60 text-sm mt-0.5">TEAM EYE (Engineering Your Experience)</p>
          </div>
          <p className="text-white/40 text-xs">
            Built with Claude AI + GhanaNLP · Cursor Hackathon Ghana 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
