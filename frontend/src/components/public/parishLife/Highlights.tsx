import type { Highlight } from '../../../types/admin'
import { HIGHLIGHT_ICONS } from '../../../utils/highlightIcons'

export default function Highlights({ highlights }: { highlights: Highlight[] }) {
  if (!highlights.length) return null
  return (
    <section className="border-b border-line bg-cream/60">
      <ul className="container-public flex flex-wrap justify-center gap-y-6 py-6 lg:flex-nowrap lg:divide-x lg:divide-accent/25">
        {highlights.map(({ id, title, text, icon }) => {
          const Icon = HIGHLIGHT_ICONS[icon].icon
          return (
            <li key={id} className="w-1/2 px-3 text-center sm:w-1/3 lg:w-auto lg:flex-1">
              <span className="mx-auto flex size-13 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-gold">
                <Icon className="size-6" strokeWidth={2} />
              </span>
              <h2 className="mt-3 font-display text-[0.9375rem] font-bold text-primary">{title}</h2>
              <p className="mx-auto mt-1 max-w-40 text-[0.8125rem] leading-snug text-ink-soft">{text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
