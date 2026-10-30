import { Sun } from 'lucide-react'
import type { AboutHero } from '../../../types/admin'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import SectionCard from '../common/SectionCard'
import HeroPreview from './HeroPreview'

interface HeroSectionEditorProps {
  value: AboutHero
  onChange: (value: AboutHero) => void
}

export default function HeroSectionEditor({ value, onChange }: HeroSectionEditorProps) {
  const update = (patch: Partial<AboutHero>) => onChange({ ...value, ...patch })

  return (
    <SectionCard title="Hero Section" icon={Sun} iconClassName="text-warning" serif>
      <div className="grid gap-6 pl-1 lg:grid-cols-2">
        <div className="space-y-4">
          <FormField label="Section Title" value={value.title} onChange={(title) => update({ title })} />
          <FormField label="Section Subtitle" value={value.subtitle} onChange={(subtitle) => update({ subtitle })} />
          <div>
            <p className="form-label">Hero Background Image</p>
            <ImageUpload
              value={value.image}
              onChange={(image) => update({ image })}
              alt="Hero background"
              className="h-22"
            />
          </div>
        </div>
        <HeroPreview {...value} />
      </div>
    </SectionCard>
  )
}
