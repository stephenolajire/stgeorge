import type { ParishGroup } from '../../../types/admin'
import Eyebrow from '../Eyebrow'
import HorizontalScroller from '../HorizontalScroller'
import GroupCard from './GroupCard'

export default function ParishGroups({ groups }: { groups: ParishGroup[] }) {
  if (!groups.length) return null
  return (
    <section id="groups" className="scroll-mt-20 bg-cream py-8">
      <div className="container-public">
        <HorizontalScroller
          label="parish groups"
          header={
            <>
              <Eyebrow>Our Parish Groups</Eyebrow>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-primary sm:text-[1.875rem]">Communities Within Our Parish</h2>
            </>
          }
        >
          {groups.map((group) => (
            <div
              key={group.id}
              className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
            >
              <GroupCard group={group} />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  )
}
