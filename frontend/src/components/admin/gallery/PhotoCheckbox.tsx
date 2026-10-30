import { Check } from 'lucide-react'

interface PhotoCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}

/** Square checkbox drawn on top of a photo. */
export default function PhotoCheckbox({ checked, onChange, label, className = '' }: PhotoCheckboxProps) {
  return (
    <label className={`flex size-6 cursor-pointer items-center justify-center rounded-md border-2 shadow-card transition ${
      checked ? 'border-brand bg-brand text-white' : 'border-white bg-white/90 text-transparent hover:border-brand/60'
    } ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" aria-label={label} />
      <Check className="size-4" strokeWidth={3} />
    </label>
  )
}
