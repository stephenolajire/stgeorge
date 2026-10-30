import { ChartColumn } from 'lucide-react'
import type { OverviewMetric, OverviewRange, VisitorPoint } from '../../../types/admin'
import { RANGE_OPTIONS } from '../../../utils/overviewRange'
import SectionCard from '../common/SectionCard'
import OverviewMetricItem from './OverviewMetricItem'
import RangeSelect from './RangeSelect'
import VisitorChart from './VisitorChart'

interface WebsiteOverviewProps {
  range: OverviewRange
  onRangeChange: (range: OverviewRange) => void
  /** Undefined while loading. */
  visitors?: VisitorPoint[]
  metrics?: OverviewMetric[]
  error?: string
}

export default function WebsiteOverview({ range, onRangeChange, visitors, metrics, error }: WebsiteOverviewProps) {
  const option = RANGE_OPTIONS.find((o) => o.value === range) ?? RANGE_OPTIONS[1]

  return (
    <SectionCard
      title="Website Overview"
      subtitle={`Visitor activity in the ${option.label.toLowerCase()}`}
      icon={ChartColumn}
      action={<RangeSelect value={range} onChange={onRangeChange} />}
      className="h-full"
    >
      {error ? (
        <p className="flex h-45 items-center justify-center text-sm text-danger">{error}</p>
      ) : visitors ? (
        <VisitorChart data={visitors} />
      ) : (
        <p className="flex h-45 items-center justify-center text-sm text-muted">Loading visitors...</p>
      )}
      {metrics && (
        <div className="mt-3 grid grid-cols-2 gap-y-5 border-t border-line pt-4 md:grid-cols-4 md:divide-x md:divide-line">
          {metrics.map((metric) => (
            <div key={metric.label} className="px-1 md:px-4 xl:px-2.5 2xl:px-6">
              <OverviewMetricItem {...metric} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
