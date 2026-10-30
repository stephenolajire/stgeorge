import { CalendarDays, ExternalLink } from 'lucide-react'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { ChurchInfo } from '../../../types/admin'
import { formatLongDate } from '../../../utils/format'

interface WelcomeHeaderProps {
  firstName: string
  church: ChurchInfo
  today: Date
}

export default function WelcomeHeader({ firstName, church, today }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-[1.75rem] leading-tight font-extrabold text-ink">
          Welcome back, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-0.5 text-base text-muted">
          Manage your parish website content, keep your community informed and connected.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4">
        <div className="card flex items-center gap-4 px-5 py-3">
          <CalendarDays className="size-7 text-brand" strokeWidth={1.6} />
          <div>
            <p className="text-sm font-semibold text-ink">{formatLongDate(today)}</p>
            <p className="text-xs text-muted">
              {church.name}, {church.location.split(',')[0]}
            </p>
          </div>
        </div>
        <a
          href={PUBLIC_PATHS.home}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-brand bg-surface px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
        >
          View Website <ExternalLink className="size-4" />
        </a>
      </div>
    </div>
  )
}
