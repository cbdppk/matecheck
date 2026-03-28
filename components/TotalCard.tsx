interface TotalCardProps {
  total: number;
}

export default function TotalCard({ total }: TotalCardProps) {
  return (
    <div className="sticky top-0 z-10 md:hidden bg-[#1E7A4A] rounded-b-3xl shadow-[0_10px_36px_rgba(30,122,74,0.38)] px-6 pt-5 pb-7">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-white/90">MateCheck</span>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <p className="text-[44px] font-bold tracking-tight text-white leading-none mt-3">
        GHS {total}
      </p>
      <p className="text-xs text-white/60 font-normal mt-1">made so far today</p>
    </div>
  );
}
