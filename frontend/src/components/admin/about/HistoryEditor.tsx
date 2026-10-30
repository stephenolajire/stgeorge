import { History } from 'lucide-react'
import type { AboutHistory } from '../../../types/admin'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'

interface HistoryEditorProps {
  value: AboutHistory
  onChange: (value: AboutHistory) => void
}

export default function HistoryEditor({ value, onChange }: HistoryEditorProps) {
  const update = (patch: Partial<AboutHistory>) => onChange({ ...value, ...patch })

  return (
    <SectionCard title="Our History" icon={History} serif>
      <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <FormField label="Section Title" value={value.title} onChange={(title) => update({ title })} maxLength={150} />
          <div>
            <TextAreaField
              label="History"
              value={value.text}
              onChange={(text) => update({ text })}
              rows={7}
              maxLength={5000}
            />
            <p className="mt-1.5 text-xs text-muted">Leave a blank line between paragraphs.</p>
          </div>
        </div>
        <div>
          <p className="form-label">History Image</p>
          <ImageUpload
            value={value.image}
            onChange={(image) => update({ image })}
            alt="History image"
            controls="hover"
            className="h-56"
          />
        </div>
      </div>
    </SectionCard>
  )
}
