import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { MediaImage } from '../../../types/admin'
import { JOIN_CTA } from '../../../utils/aboutContent'
import Eyebrow from '../Eyebrow'

export default function JoinCommunity({ image }: { image: MediaImage | null }) {
  return (
    <section className="relative overflow-hidden bg-primary">
      {image && <img src={image.url} alt="" className="absolute inset-0 size-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative mx-auto max-w-2xl px-5 py-4.5 text-center">
        <Eyebrow className="text-accent">{JOIN_CTA.eyebrow}</Eyebrow>
        <h2 className="mt-1.5 font-display text-2xl font-bold text-white sm:text-[1.625rem]">{JOIN_CTA.title}</h2>
        <p className="mt-2 text-xs text-white/90">{JOIN_CTA.text}</p>
        <Link
          to={PUBLIC_PATHS.contact}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-accent px-7 text-xs font-semibold text-primary hover:bg-accent-hover"
        >
          Get Involved <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
