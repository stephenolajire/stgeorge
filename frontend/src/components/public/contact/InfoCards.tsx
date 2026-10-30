import { Clock, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ContactPageContent } from '../../../types/admin'

function InfoCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-mist px-5 py-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-gold">
        <Icon className="size-5.5" strokeWidth={2.2} />
      </span>
      <h2 className="mt-3 font-display text-base font-bold text-primary">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  )
}

/** Location, phone, email and office hours. Cards without details are left out. */
export default function InfoCards({ details }: { details: ContactPageContent['details'] }) {
  const { address, phone, phoneHours, email, emailNote, officeDays, officeHours } = details
  return (
    <section className="container-public-wide grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4 py-6">
      {address && (
        <InfoCard icon={MapPin} title="Our Location">
          <p className="whitespace-pre-line">{address}</p>
        </InfoCard>
      )}
      {phone && (
        <InfoCard icon={Phone} title="Phone">
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="block text-ink hover:text-brand">
            {phone}
          </a>
          {phoneHours && <p className="text-[0.8125rem]">{phoneHours}</p>}
        </InfoCard>
      )}
      {email && (
        <InfoCard icon={Mail} title="Email">
          <a href={`mailto:${email}`} className="block break-all text-ink hover:text-brand">
            {email}
          </a>
          {emailNote && <p className="text-[0.8125rem]">{emailNote}</p>}
        </InfoCard>
      )}
      {(officeDays || officeHours) && (
        <InfoCard icon={Clock} title="Office Hours">
          {officeDays && <p>{officeDays}</p>}
          {officeHours && <p>{officeHours}</p>}
        </InfoCard>
      )}
    </section>
  )
}
