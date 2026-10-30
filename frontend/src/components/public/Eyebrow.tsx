/** Small gold label above a section heading, e.g. "WHO WE ARE". `line` adds a short rule before it. */
export default function Eyebrow({ children, className = '', line = false }: { children: string; className?: string; line?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-gold uppercase ${className}`}>
      {line && <span className="h-0.5 w-8 bg-accent" aria-hidden />}
      {children}
    </p>
  )
}
