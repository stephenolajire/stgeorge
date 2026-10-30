import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MediaImage } from '../../types/admin'
import Eyebrow from './Eyebrow'

interface CallToActionProps {
  eyebrow: string
  title: string
  text: string
  buttonLabel: string
  to: string
  /** Faint background photo. */
  image: MediaImage | null
}

/** Navy banner with a gold button, used at the bottom of public pages. */
export default function CallToAction({ eyebrow, title, text, buttonLabel, to, image }: CallToActionProps) {
  return (
    <section className="relative overflow-hidden bg-primary">
      {image && <img src={image.url} alt="" className="absolute inset-0 size-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative mx-auto max-w-2xl px-5 py-6 text-center">
        <Eyebrow className="text-accent">{eyebrow}</Eyebrow>
        <h2 className="mt-1.5 font-display text-2xl font-bold text-white sm:text-[1.875rem]">{title}</h2>
        <p className="mt-2 text-sm text-white/90">{text}</p>
        <Link
          to={to}
          className="mt-4 inline-flex h-9.5 items-center gap-2 rounded-md bg-accent px-7 text-xs font-semibold text-primary hover:bg-accent-hover"
        >
          {buttonLabel} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
