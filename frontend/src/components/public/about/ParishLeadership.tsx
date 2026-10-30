import type { Member } from '../../../types/admin'
import Eyebrow from '../Eyebrow'
import PriestCard from './PriestCard'

interface ParishLeadershipProps {
  leaders: Member[]
  diocese: string
}

/** Gold line–cross–line ornament under the heading. */
function Ornament() {
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5 text-gold" aria-hidden>
      <span className="h-0.5 w-16 bg-current" />
      <svg viewBox="0 0 12 16" className="size-4 fill-current">
        <path d="M5 0h2v5h5v2H7v9H5V7H0V5h5z" />
      </svg>
      <span className="h-0.5 w-16 bg-current" />
    </div>
  )
}

export default function ParishLeadership({ leaders, diocese }: ParishLeadershipProps) {
  if (!leaders.length) return null

  return (
    <section className="bg-cream py-4 pb-4">
      <div className="container-public-wide text-center">
        <Eyebrow>Our Parish Leadership</Eyebrow>
        <h2 className="mt-1.5 font-display text-2xl font-bold text-primary sm:text-[1.75rem]">Priests of Our Parish</h2>
        <Ornament />
        <div className="mt-4 flex flex-wrap justify-center gap-2.5 text-left">
          {leaders.map((member) => (
            <div key={member.id} className="w-full sm:w-[calc(50%-0.3125rem)] lg:w-[calc(33.333%-0.4375rem)]">
              <PriestCard member={member} diocese={diocese} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
