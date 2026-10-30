import { Calendar, Church } from 'lucide-react'
import type { ParishInformation } from '../../../types/admin'
import FormField from '../common/FormField'
import SectionCard from '../common/SectionCard'

interface ParishInfoCardProps {
  value: ParishInformation
  onChange: (value: ParishInformation) => void
}

export default function ParishInfoCard({ value, onChange }: ParishInfoCardProps) {
  const update = (patch: Partial<ParishInformation>) => onChange({ ...value, ...patch })

  return (
    <SectionCard title="Parish Information" icon={Church} serif className="pb-6">
      <div className="mt-2 space-y-3.5 pl-1">
        <FormField
          label="Established"
          value={value.established}
          onChange={(established) => update({ established: established.replace(/\D/g, '').slice(0, 4) })}
          inputMode="numeric"
          icon={Calendar}
        />
        <FormField label="Diocese" value={value.diocese} onChange={(diocese) => update({ diocese })} />
        <FormField
          label="Parish Priest"
          value={value.parishPriest}
          onChange={(parishPriest) => update({ parishPriest })}
        />
        <FormField label="Location" value={value.location} onChange={(location) => update({ location })} />
      </div>
    </SectionCard>
  )
}
