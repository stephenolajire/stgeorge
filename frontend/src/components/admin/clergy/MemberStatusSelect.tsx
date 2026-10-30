import type { StatusOption } from '../../../types/admin'
import StatusPillSelect from '../common/StatusPillSelect'

const OPTIONS: StatusOption[] = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'inactive', label: 'Inactive', tone: 'neutral' },
]

interface MemberStatusSelectProps {
  isActive: boolean
  onChange: (isActive: boolean) => void
}

export default function MemberStatusSelect({ isActive, onChange }: MemberStatusSelectProps) {
  return (
    <StatusPillSelect value={isActive ? 'active' : 'inactive'} onChange={(v) => onChange(v === 'active')} options={OPTIONS} />
  )
}
