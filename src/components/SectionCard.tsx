import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionCard({ children, className = "", id }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-3xl border border-champagne-200/80 bg-white/70 p-6 shadow-lg shadow-blush-900/5 backdrop-blur-md transition hover:border-champagne-300 hover:shadow-xl md:p-10 ${className}`}
    >
      {children}
    </section>
  );
}
