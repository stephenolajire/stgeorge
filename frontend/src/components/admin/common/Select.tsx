import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Shown as the first option with an empty value, e.g. "All Roles". */
  placeholder?: string
}

export default function Select({ value, onChange, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input appearance-none pr-9 text-ink"
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft" />
    </div>
  )
}

/** Select with a label above it. */
export function SelectField({ label, ...props }: SelectProps & { label: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <Select id={id} {...props} />
    </div>
  )
}
