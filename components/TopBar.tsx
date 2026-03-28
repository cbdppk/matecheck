interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = "Today's trips" }: TopBarProps) {
  return (
    <div className="hidden md:flex bg-white border-b border-slate-100 px-6 py-4 justify-between items-center flex-shrink-0">
      <span className="text-[15px] font-semibold text-slate-900">{title}</span>

      <div className="flex items-center gap-3">
        <span className="bg-green-100 text-green-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
          Live
        </span>
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1E7A4A" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
