import type { LucideIcon } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
  /** Icon shown at the right edge of the input. */
  icon?: LucideIcon
  inputClassName?: string
}

export default function FormField({
  label,
  value,
  onChange,
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}: FormFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`form-input ${Icon ? 'pr-11' : ''} ${inputClassName}`}
          {...props}
        />
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center border-l border-field-border text-muted">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </div>
  )
}
