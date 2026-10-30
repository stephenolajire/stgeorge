import type { AboutHero } from '../../../types/admin'

/** Live preview of the hero banner as it appears on the public About page. */
export default function HeroPreview({ title, subtitle, image }: AboutHero) {
  return (
    <div className="relative flex min-h-68 flex-col items-center justify-end overflow-hidden rounded-md bg-primary px-6 pb-8 text-center">
      {image && <img src={image.url} alt="" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-primary/70 to-primary" />
      <div className="relative w-full">
        {/* The accent line lines up with the start of the title. */}
        <div className="inline-block text-left">
          <span className="mb-3 block h-0.5 w-22 bg-accent" />
          <h2 className="font-display text-[2.375rem] leading-tight font-bold text-white">
            {title || 'Section title'}
          </h2>
        </div>
        <p className="mx-auto mt-3 max-w-80 text-base leading-snug text-white/90">{subtitle}</p>
      </div>
    </div>
  )
}
