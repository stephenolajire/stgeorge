import type { Highlight } from '../../../types/admin'
import { HIGHLIGHT_ICONS } from '../../../utils/highlightIcons'

/** The row under the banner: Worship, Community, Service, Growth. */
export default function HomeHighlights({ highlights }: { highlights: Highlight[] }) {
  if (!highlights.length) return null
  return (
    <section className="border-b border-line bg-white">
      <ul className="container-public grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:flex lg:justify-around">
        {highlights.map(({ id, title, text, icon }) => {
          const Icon = HIGHLIGHT_ICONS[icon].icon
          return (
            <li key={id} className="text-center lg:max-w-60 lg:flex-1">
              <span className="mx-auto flex size-20 items-center justify-center rounded-full border border-accent/50 bg-cream text-gold">
                <Icon className="size-9" strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-primary">{title}</h2>
              <p className="mx-auto mt-2 max-w-56 text-[0.9375rem] leading-snug text-ink-soft">{text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
