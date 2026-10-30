import { BookOpenText } from 'lucide-react'
import type { ParishLifeIntro } from '../../../types/admin'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'

interface IntroEditorProps {
  value: ParishLifeIntro
  onChange: (value: ParishLifeIntro) => void
}

export default function IntroEditor({ value, onChange }: IntroEditorProps) {
  const update = (patch: Partial<ParishLifeIntro>) => onChange({ ...value, ...patch })

  return (
    <div id="introduction" className="scroll-mt-20">
      <SectionCard title="Introduction" subtitle={'The "Living Our Faith" block.'} icon={BookOpenText} serif>
        <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4">
            <FormField label="Title" value={value.title} onChange={(title) => update({ title })} maxLength={150} />
            <div>
              <TextAreaField label="Text" value={value.text} onChange={(text) => update({ text })} rows={6} maxLength={5000} />
              <p className="mt-1.5 text-xs text-muted">Leave a blank line between paragraphs.</p>
            </div>
          </div>
          <div>
            <p className="form-label">Image</p>
            <ImageUpload
              value={value.image}
              onChange={(image) => update({ image })}
              alt="Introduction image"
              controls="hover"
              className="h-52"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
