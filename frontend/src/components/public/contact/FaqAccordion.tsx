import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { FAQ } from '../../../types/admin'
import Eyebrow from '../Eyebrow'

interface FaqAccordionProps {
  title: string
  subtitle: string
  faqs: FAQ[]
}

/** Questions that open to show their answer. One open at a time. */
export default function FaqAccordion({ title, subtitle, faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null)
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <Eyebrow line>Frequently Asked</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{subtitle}</p>}
      <ul className="mt-5 space-y-2.5">
        {faqs.map((faq) => {
          const open = openId === faq.id
          return (
            <li key={faq.id} className="rounded-md border border-line">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : faq.id)}
                aria-expanded={open}
                aria-controls={`faq-${faq.id}`}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-ink hover:text-primary"
              >
                {faq.question}
                <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <p id={`faq-${faq.id}`} className="border-t border-line px-3.5 py-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                  {faq.answer}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
