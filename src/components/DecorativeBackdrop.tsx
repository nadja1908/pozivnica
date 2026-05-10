export function DecorativeBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-gradient-to-br from-amber-200/50 to-blush-200/40 blur-3xl" />
      <div className="absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-gradient-to-bl from-violet-300/35 to-blush-300/30 blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-blush-300/25 blur-2xl" />
      <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-amber-100/40 blur-2xl" />

      <svg
        className="absolute right-[6%] top-[10%] h-28 w-24 animate-float text-blush-400/55 drop-shadow-lg"
        viewBox="0 0 80 100"
        fill="currentColor"
      >
        <ellipse cx="40" cy="28" rx="36" ry="40" />
        <line
          x1="40"
          y1="68"
          x2="40"
          y2="96"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute bottom-[18%] left-[4%] h-20 w-[4.5rem] animate-drift text-amber-500/45"
        viewBox="0 0 80 100"
        fill="currentColor"
      >
        <ellipse cx="40" cy="28" rx="36" ry="40" />
        <line
          x1="40"
          y1="68"
          x2="40"
          y2="96"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute left-[12%] top-[38%] h-2 w-2 rounded-full bg-amber-400 animate-twinkle shadow-[0_0_14px_6px_rgba(251,191,36,0.45)]" />
      <div
        className="absolute right-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-blush-400 animate-twinkle shadow-[0_0_12px_4px_rgba(236,125,149,0.5)]"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute right-[40%] bottom-[28%] h-1 w-1 rounded-full bg-violet-400 animate-twinkle"
        style={{ animationDelay: "2.4s" }}
      />
      <div
        className="absolute left-[28%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-champagne-500/70 animate-shimmer"
        style={{ animationDelay: "0.5s" }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />
    </div>
  );
}
