import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../../../types/admin'

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <ChevronRight className="size-3.5" />}
          {item.path ? (
            <Link to={item.path} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-ink-soft' : ''}>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
