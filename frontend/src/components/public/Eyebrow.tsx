/** Small gold label above a section heading, e.g. "WHO WE ARE". */
export default function Eyebrow({ children, className = '' }: { children: string; className?: string }) {
  return <p className={`text-xs font-semibold tracking-[0.14em] text-gold uppercase ${className}`}>{children}</p>
}
