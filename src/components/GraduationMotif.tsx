/** Mala dekoracija — kapa za maturu (diskretno, u liniji sa temom) */
export function GraduationCapMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M32 6L4 18l28 12 28-12L32 6z"
        fill="url(#capGrad)"
        stroke="#b8860b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M32 18v20"
        stroke="#9a7209"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="12" r="3" fill="#C99A2E" opacity="0.9" />
      <ellipse cx="32" cy="42" rx="8" ry="2" fill="#c88956" opacity="0.35" />
      <defs>
        <linearGradient id="capGrad" x1="4" y1="6" x2="60" y2="30">
          <stop stopColor="#1a1a1a" />
          <stop offset="1" stopColor="#3d3d3d" />
        </linearGradient>
      </defs>
    </svg>
  );
}
