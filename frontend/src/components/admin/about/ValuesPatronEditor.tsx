import { HeartHandshake } from 'lucide-react'
import { toLines } from '../../../utils/text'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'

interface ValuesPatronEditorProps {
  coreValues: string
  patron: string
  onCoreValuesChange: (text: string) => void
  onPatronChange: (text: string) => void
}

export default function ValuesPatronEditor({
  coreValues,
  patron,
  onCoreValuesChange,
  onPatronChange,
}: ValuesPatronEditorProps) {
  const count = toLines(coreValues).length

  return (
    <SectionCard title="Core Values & Patron" icon={HeartHandshake} serif>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <TextAreaField
            label="Our Core Values"
            value={coreValues}
            onChange={onCoreValuesChange}
            rows={6}
            maxLength={2000}
            placeholder={'Faith in Christ\nPrayer and Worship'}
          />
          <p className="mt-1.5 text-xs text-muted">
            One value per line · {count} {count === 1 ? 'value' : 'values'}
          </p>
        </div>
        <TextAreaField label="Our Patron" value={patron} onChange={onPatronChange} rows={6} maxLength={2000} />
      </div>
    </SectionCard>
  )
}
