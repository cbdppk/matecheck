import Link from "next/link";

export default function HomePage() {
  return (
    <main className="screen-shell flex flex-col">
      <div className="bg-gradient-to-br from-brand to-brand-dark px-5 py-8 text-white">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/80">
          Cursor Hackathon Ghana
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">
          MateCheck
        </h1>
        <p className="mt-4 text-base leading-7 text-white/90">
          A mobile-first trotro revenue tracker for owners who want daily visibility
          into what each driver earned.
        </p>
      </div>

      <div className="flex-1 space-y-4 p-5">
        <section className="section-card">
          <h2 className="text-xl font-semibold text-ink">What this starter already gives you</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            <li>• Driver logging screen with mic-ready input flow</li>
            <li>• Owner dashboard and vehicle detail pages</li>
            <li>• Sample Ghana vehicle data and earnings history</li>
            <li>• Starter API routes for voice log, summary, dispute, and Neon init</li>
            <li>• Team prompts, skills, workflow docs, and role handoffs</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <Link href="/driver" className="primary-btn">
            Open Driver Screen
          </Link>
          <Link href="/owner" className="secondary-btn">
            Open Owner Dashboard
          </Link>
        </section>

        <section className="section-card">
          <h2 className="text-lg font-semibold">Hackathon flow</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            <li>1. Read the docs in <code>docs/</code></li>
            <li>2. Run the Cursor init prompt files in <code>prompts/</code></li>
            <li>3. Fill in your env vars</li>
            <li>4. Replace the placeholder API logic with live Claude and GhanaNLP calls</li>
            <li>5. Deploy and freeze the demo early</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
