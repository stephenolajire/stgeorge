import { ArrowDown, ArrowUp } from 'lucide-react'
import type { DashboardStat } from '../../../types/admin'
import { toneIcon } from '../../../utils/tone'

export default function StatCard({ label, value, note, trend, icon: Icon, tone }: DashboardStat) {
  const TrendIcon = trend === 'down' ? ArrowDown : ArrowUp
  const trendColor = trend === 'down' ? 'text-danger' : trend === 'up' ? 'text-success' : 'text-muted'

  return (
    <div className="card flex items-center gap-4 px-4 py-5 xl:gap-3 xl:px-3.5 2xl:gap-5 2xl:px-4">
      <span
        className={`${toneIcon[tone]} flex size-14 shrink-0 items-center justify-center rounded-xl xl:size-11 2xl:size-15`}
      >
        <Icon className="size-6.5 xl:size-5.5 2xl:size-6.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.8125rem] leading-tight text-ink-soft">{label}</p>
        <p className="mt-2 font-display text-[1.625rem] leading-none font-bold text-ink">
          {value.toLocaleString()}
        </p>
        <p className={`mt-2.5 flex items-center gap-1 text-[0.8125rem] whitespace-nowrap ${trendColor}`}>
          {trend && <TrendIcon className="size-3.5" strokeWidth={2.25} />}
          {note}
        </p>
      </div>
    </div>
  )
}
