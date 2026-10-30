import { ChartColumn } from 'lucide-react'
import { useState } from 'react'
import type { OverviewMetric, OverviewRange, VisitorPoint } from '../../../types/admin'
import { RANGE_OPTIONS } from '../../../utils/overviewRange'
import SectionCard from '../common/SectionCard'
import OverviewMetricItem from './OverviewMetricItem'
import RangeSelect from './RangeSelect'
import VisitorChart from './VisitorChart'

interface WebsiteOverviewProps {
  visitors: VisitorPoint[]
  metrics: OverviewMetric[]
}

export default function WebsiteOverview({ visitors, metrics }: WebsiteOverviewProps) {
  const [range, setRange] = useState<OverviewRange>('30d')
  const option = RANGE_OPTIONS.find((o) => o.value === range) ?? RANGE_OPTIONS[1]

  return (
    <SectionCard
      title="Website Overview"
      subtitle={`Visitor activity in the ${option.label.toLowerCase()}`}
      icon={ChartColumn}
      action={<RangeSelect value={range} onChange={setRange} />}
      className="h-full"
    >
      <VisitorChart data={visitors.slice(-option.days)} />
      <div className="mt-3 grid grid-cols-2 gap-y-5 border-t border-line pt-4 md:grid-cols-4 md:divide-x md:divide-line">
        {metrics.map((metric) => (
          <div key={metric.label} className="px-1 md:px-4 xl:px-2.5 2xl:px-6">
            <OverviewMetricItem {...metric} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
