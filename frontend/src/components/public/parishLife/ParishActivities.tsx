import { useState } from 'react'
import type { Activity } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Modal from '../../admin/common/Modal'
import Eyebrow from '../Eyebrow'
import HorizontalScroller from '../HorizontalScroller'
import ActivityCard from './ActivityCard'

export default function ParishActivities({ activities }: { activities: Activity[] }) {
  const [open, setOpen] = useState<Activity | null>(null)
  if (!activities.length) return null

  return (
    <section id="activities" className="container-public scroll-mt-20 py-8">
      <HorizontalScroller
        label="parish activities"
        header={
          <>
            <Eyebrow>Parish Activities</Eyebrow>
            <h2 className="mt-1.5 font-display text-2xl font-bold text-primary sm:text-[1.875rem]">Growing Together in Faith</h2>
          </>
        }
      >
        {activities.map((activity) => (
          <div key={activity.id} className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
            <ActivityCard activity={activity} onOpen={() => setOpen(activity)} />
          </div>
        ))}
      </HorizontalScroller>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open?.image && <img src={open.image} alt="" className="mb-4 aspect-[2/1] w-full rounded-md object-cover" />}
        <div className="max-h-[50vh] space-y-3 overflow-y-auto text-sm leading-relaxed text-ink-soft">
          {toParagraphs(open?.content ?? '').map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </section>
  )
}
