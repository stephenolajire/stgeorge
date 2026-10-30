import type { ReactNode } from 'react'
import type { BreadcrumbItem } from '../../../types/admin'
import Breadcrumb from './Breadcrumb'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  /** Buttons shown on the right. */
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="-mt-2.5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[0.9375rem] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 lg:mt-3">{actions}</div>}
    </div>
  )
}
