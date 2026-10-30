import type { LucideIcon } from 'lucide-react'
import type { Tone } from '../../../types/admin'
import { toneIcon } from '../../../utils/tone'
import TextAreaField from '../common/TextAreaField'

interface MissionVisionItemProps {
  title: string
  icon: LucideIcon
  tone: Tone
  value: string
  onChange: (text: string) => void
}

export default function MissionVisionItem({ title, icon: Icon, tone, value, onChange }: MissionVisionItemProps) {
  return (
    <div className="flex gap-4">
      <span className={`${toneIcon[tone]} flex size-14 shrink-0 items-center justify-center rounded-full`}>
        <Icon className="size-7" strokeWidth={2} />
      </span>
      <TextAreaField
        label={title}
        value={value}
        onChange={onChange}
        rows={5}
        maxLength={2000}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
