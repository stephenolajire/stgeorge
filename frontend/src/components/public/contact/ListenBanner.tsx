import type { ContactPageContent } from '../../../types/admin'
import Eyebrow from '../Eyebrow'

/** Navy banner with a photo and a Bible quote ("A Church Family Always Ready to Listen"). */
export default function ListenBanner({ banner }: { banner: ContactPageContent['banner'] }) {
  if (!banner.title && !banner.quote) return null
  return (
    <div className="relative flex min-h-80 items-center overflow-hidden rounded-xl bg-primary">
      {banner.image && <img src={banner.image.url} alt="" className="absolute inset-0 size-full object-cover object-right" />}
      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/85 to-primary/10" />
      <div className="relative max-w-md px-8 py-10">
        <Eyebrow className="text-accent">We Are Here For You</Eyebrow>
        {banner.title && <h2 className="mt-2 font-display text-3xl leading-tight font-bold text-white">{banner.title}</h2>}
        <span className="mt-4 block h-0.5 w-16 bg-accent" />
        {banner.quote && (
          <blockquote className="mt-4 font-display text-lg leading-relaxed text-white/90 italic">“{banner.quote}”</blockquote>
        )}
        {banner.quoteSource && (
          <p className="mt-3 flex items-center gap-3 text-sm text-white/85">
            <span className="h-px w-5 bg-white/70" aria-hidden /> {banner.quoteSource}
          </p>
        )}
      </div>
    </div>
  )
}
