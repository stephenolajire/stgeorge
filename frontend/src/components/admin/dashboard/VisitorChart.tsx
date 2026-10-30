import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { VisitorPoint } from '../../../types/admin'
import { formatAxisDate } from '../../../utils/format'

// Colours come from the theme tokens in index.css.
const STROKE = 'var(--color-brand)'
const GRID = 'var(--color-line)'
const AXIS = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-muted)'

const Y_TICKS = [0, 50, 100, 150, 200]
// Day-of-month labels shown on the x-axis.
const X_TICK_DAYS = [1, 5, 10, 15, 20, 25, 30]

interface DotProps {
  cx?: number
  cy?: number
  index?: number
}

export default function VisitorChart({ data }: { data: VisitorPoint[] }) {
  const lastIndex = data.length - 1
  const xTicks = data.length > 10 ? data.filter((p) => X_TICK_DAYS.includes(new Date(p.date).getDate())).map((p) => p.date) : undefined

  // A dot on every other point (and the last one), as in the design.
  const renderDot = ({ cx, cy, index = 0 }: DotProps) =>
    index % 2 === 0 || index === lastIndex ? (
      <circle key={index} cx={cx} cy={cy} r={3.5} fill={STROKE} />
    ) : (
      <g key={index} />
    )

  return (
    <div className="h-45 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={STROKE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={STROKE} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} />
          <XAxis
            dataKey="date"
            ticks={xTicks}
            tickFormatter={formatAxisDate}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            axisLine={{ stroke: AXIS }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 200]}
            ticks={Y_TICKS}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            axisLine={{ stroke: AXIS }}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(label) => formatAxisDate(String(label))}
            formatter={(value) => [value, 'Visitors']}
            contentStyle={{ borderRadius: 8, borderColor: 'var(--color-line)', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke={STROKE}
            strokeWidth={2}
            fill="url(#visitorFill)"
            dot={renderDot}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
