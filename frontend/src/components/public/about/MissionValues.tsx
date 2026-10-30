import { CircleCheck, Eye, Heart, Target, Users } from 'lucide-react'
import { toLines } from '../../../utils/text'
import ValueCard from './ValueCard'

interface MissionValuesProps {
  mission: string
  vision: string
  /** One value per line. */
  coreValues: string
  patron: string
}

export default function MissionValues({ mission, vision, coreValues, patron }: MissionValuesProps) {
  return (
    <section className="container-public-wide">
      <div className="grid gap-6 rounded-xl bg-mist py-4.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-accent/25">
        <ValueCard title="Our Mission" icon={Target}>
          <p className="whitespace-pre-line">{mission}</p>
        </ValueCard>
        <ValueCard title="Our Vision" icon={Eye}>
          <p className="whitespace-pre-line">{vision}</p>
        </ValueCard>
        <ValueCard title="Our Core Values" icon={Heart} filled>
          <ul className="space-y-1">
            {toLines(coreValues).map((value) => (
              <li key={value} className="flex items-center gap-2.5">
                <CircleCheck className="size-4.5 shrink-0 fill-gold text-white" />
                {value}
              </li>
            ))}
          </ul>
        </ValueCard>
        <ValueCard title="Our Patron" icon={Users} filled>
          <p className="whitespace-pre-line">{patron}</p>
        </ValueCard>
      </div>
    </section>
  )
}
