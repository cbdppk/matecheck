type Props = {
  title: string;
  subtitle?: string;
  id?: string;
  children: React.ReactNode;
};

export default function OwnerSection({ title, subtitle, id, children }: Props) {
  return (
    <section id={id} className="scroll-mt-4">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
      ) : null}
      <div className={subtitle ? "mt-4" : "mt-3"}>{children}</div>
    </section>
  );
}
