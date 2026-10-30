import { Car, ExternalLink } from 'lucide-react'
import type { ContactPageContent } from '../../../types/admin'
import { mapEmbedUrl, mapLinkUrl } from '../../../utils/contact'
import Eyebrow from '../Eyebrow'

export default function LocationCard({ map }: { map: ContactPageContent['map'] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <Eyebrow line>Find Us</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-bold text-primary">{map.title}</h2>
      {map.subtitle && <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{map.subtitle}</p>}

      {map.query && (
        <div className="relative mt-5 overflow-hidden rounded-lg border border-line">
          <iframe
            title={`Map: ${map.query}`}
            src={mapEmbedUrl(map.query)}
            className="block h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={mapLinkUrl(map.query)}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-brand bg-surface px-3 py-1.5 text-xs font-semibold text-brand shadow-card hover:bg-brand-soft"
          >
            View Larger Map <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      {map.directions && (
        <div className="mt-5 flex gap-4 rounded-lg bg-cream px-4 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-gold">
            <Car className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-primary">Directions</h3>
            <p className="mt-1 text-[0.8125rem] leading-relaxed whitespace-pre-line text-ink-soft">{map.directions}</p>
          </div>
        </div>
      )}
    </div>
  )
}
