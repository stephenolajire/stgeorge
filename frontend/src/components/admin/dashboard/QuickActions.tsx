import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { QuickAction } from '../../../types/admin'
import { toneTile } from '../../../utils/tone'
import CountBadge from '../common/CountBadge'
import { SectionHeader } from '../common/SectionCard'

export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div>
      <SectionHeader title="Quick Actions" subtitle="Manage your website content quickly" icon={Zap} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {actions.map(({ label, path, icon: Icon, tone, badge }) => (
          <Link
            key={label}
            to={path}
            className={`${toneTile[tone]} relative flex min-h-19 flex-col items-center justify-center gap-2 rounded-tile px-2 py-3 text-center text-[0.8125rem] font-medium transition-colors`}
          >
            <Icon className="size-6" strokeWidth={1.75} />
            {label}
            {badge !== undefined && <CountBadge count={badge} className="absolute top-1.5 right-1.5" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
