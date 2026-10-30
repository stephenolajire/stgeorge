import { Landmark } from 'lucide-react'
import type { AboutMainContent } from '../../../types/admin'
import ImageUpload from '../common/ImageUpload'
import TextAreaField from '../common/TextAreaField'
import SectionCard from '../common/SectionCard'

interface MainContentEditorProps {
  value: AboutMainContent
  onChange: (value: AboutMainContent) => void
}

export default function MainContentEditor({ value, onChange }: MainContentEditorProps) {
  return (
    <SectionCard title="Main Content" icon={Landmark} serif>
      <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
        <TextAreaField
          label="Description"
          value={value.description}
          onChange={(description) => onChange({ ...value, description })}
          rows={7}
          maxLength={5000}
        />
        <ImageUpload
          value={value.image}
          onChange={(image) => onChange({ ...value, image })}
          alt="About page image"
          controls="hover"
          className="min-h-46"
        />
      </div>
    </SectionCard>
  )
}
