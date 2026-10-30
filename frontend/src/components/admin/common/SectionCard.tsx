import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SectionCardProps {
  title: string
  icon: LucideIcon
  subtitle?: string
  /** Shows a "View All" link in the header. */
  viewAllPath?: string
  /** Custom header control, e.g. a range picker. Replaces the View All link. */
  action?: ReactNode
  /** Serif title, used on the content-editing pages. */
  serif?: boolean
  iconClassName?: string
  className?: string
  children: ReactNode
}

export default function SectionCard({
  title,
  icon: Icon,
  subtitle,
  viewAllPath,
  action,
  serif,
  iconClassName,
  className = '',
  children,
}: SectionCardProps) {
  return (
    <section className={`card flex flex-col p-4 pt-3 ${className}`}>
      <SectionHeader
        title={title}
        icon={Icon}
        subtitle={subtitle}
        viewAllPath={viewAllPath}
        action={action}
        serif={serif}
        iconClassName={iconClassName}
      />
      {children}
    </section>
  )
}

export function SectionHeader({
  title,
  icon: Icon,
  subtitle,
  viewAllPath,
  action,
  serif,
  iconClassName = 'text-ink',
}: Omit<SectionCardProps, 'children' | 'className'>) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 pl-1">
        <Icon className={`mt-0.5 size-5.5 shrink-0 ${iconClassName}`} strokeWidth={1.75} />
        <div>
          <h2 className={`card-title ${serif ? 'font-display text-[1.0625rem]' : ''}`}>{title}</h2>
          {subtitle && <p className="text-subtle">{subtitle}</p>}
        </div>
      </div>
      {action ??
        (viewAllPath && (
          <Link to={viewAllPath} className="link-action shrink-0">
            View All <ArrowRight className="size-3.5" />
          </Link>
        ))}
    </header>
  )
}
