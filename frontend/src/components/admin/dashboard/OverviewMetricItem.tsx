import { ArrowDown, ArrowUp } from 'lucide-react'
import type { OverviewMetric } from '../../../types/admin'
import { toneIcon } from '../../../utils/tone'

export default function OverviewMetricItem({ label, value, change, icon: Icon, tone }: OverviewMetric) {
  const isUp = (change ?? 0) >= 0
  const TrendIcon = isUp ? ArrowUp : ArrowDown

  return (
    <div className="flex items-start gap-3 xl:gap-2.5 2xl:gap-3">
      <span className={`${toneIcon[tone]} flex size-10 shrink-0 items-center justify-center rounded-full`}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 whitespace-nowrap">
        <p className="text-lg leading-tight font-bold text-ink">{value}</p>
        <p className="mt-0.5 text-[0.8125rem] text-muted">{label}</p>
        {change === null ? (
          <p className="mt-1.5 text-[0.8125rem] text-muted" title="No visits in the previous period to compare with">
            —
          </p>
        ) : (
          <p className={`mt-1.5 flex items-center gap-1 text-[0.8125rem] ${isUp ? 'text-success' : 'text-danger'}`}>
            <TrendIcon className="size-3.5" strokeWidth={2.25} />
            {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  )
}
