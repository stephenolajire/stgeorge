import { ChartColumn } from 'lucide-react'
import type { KeyStatistic } from '../../../types/admin'
import { toneIcon } from '../../../utils/tone'
import SectionCard from '../common/SectionCard'

export default function KeyStatistics({ stats }: { stats: KeyStatistic[] }) {
  return (
    <SectionCard title="Key Statistics" icon={ChartColumn} serif>
      <ul className="divide-y divide-line">
        {stats.map(({ label, value, icon: Icon, tone, filled }) => (
          <li key={label} className="flex items-center gap-3.5 py-2.5 first:pt-2.5">
            <span className={`${toneIcon[tone]} flex size-12 shrink-0 items-center justify-center rounded-full`}>
              <Icon className="size-5.5" strokeWidth={1.9} fill={filled ? 'currentColor' : 'none'} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-[0.8125rem] whitespace-nowrap text-muted">{value}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
