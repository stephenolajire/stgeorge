import { Church, Clock, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useContactContent } from '../../../hooks/public/contactHook'
import { PUBLIC_PATHS, publicNavItems } from '../../../routes/publicRoute'
import { CHURCH } from '../../../utils/siteConfig'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './SocialIcons'

const YEAR = new Date().getFullYear()

function ContactLine({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  )
}

export default function PublicFooter() {
  const { social } = CHURCH
  // Address, phone, email and hours are edited on the admin Contact page.
  const { data: page } = useContactContent()
  const details = page?.details
  const contact = details
    ? {
        address: details.address,
        phone: details.phone,
        email: details.email,
        hours: [details.officeDays, details.officeHours].filter(Boolean).join(': '),
      }
    : CHURCH.contact
  const socials = [
    { href: social.facebook, label: 'Facebook', icon: <FacebookIcon /> },
    { href: social.youtube, label: 'YouTube', icon: <YoutubeIcon /> },
    { href: social.instagram, label: 'Instagram', icon: <InstagramIcon /> },
  ].filter((s) => s.href)

  return (
    <footer className="bg-surface">
      <div className="container-public grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr]">
        <div>
          <Link to={PUBLIC_PATHS.home} className="flex items-center gap-3">
            {CHURCH.logoUrl ? (
              <img src={CHURCH.logoUrl} alt="" className="size-14 rounded-full object-contain" />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-full border-[3px] border-success bg-white text-danger">
                <Church className="size-6" />
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-[0.6875rem] text-ink-soft">{CHURCH.diocese}</span>
              <span className="block font-display text-base font-bold text-primary">{CHURCH.name}</span>
              <span className="block text-xs text-ink-soft">{CHURCH.location}.</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{CHURCH.tagline}</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-4">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="transition hover:opacity-80">
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-semibold text-primary">Quick Links</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {publicNavItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-primary">Our Parish</h2>
          <ul className="mt-3 space-y-3 text-sm text-ink-soft">
            {contact.address && <ContactLine icon={MapPin}>{contact.address}</ContactLine>}
            {contact.phone && (
              <ContactLine icon={Phone}>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                  {contact.phone}
                </a>
              </ContactLine>
            )}
            {contact.email && (
              <ContactLine icon={Mail}>
                <a href={`mailto:${contact.email}`} className="break-all hover:text-primary">
                  {contact.email}
                </a>
              </ContactLine>
            )}
            {contact.hours && <ContactLine icon={Clock}>{contact.hours}</ContactLine>}
          </ul>
        </div>
      </div>

      <div className="bg-primary">
        <div className="container-public flex flex-col gap-2 py-4 text-xs text-white/85 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {YEAR} {CHURCH.name}, {CHURCH.location.split(',')[0]}. All Rights Reserved.
          </p>
          <p className="flex items-center gap-3">
            <Link to={PUBLIC_PATHS.privacy} className="hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden>|</span>
            <Link to={PUBLIC_PATHS.terms} className="hover:text-white">
              Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
