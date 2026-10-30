import { useId, type TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
}

/** Plain text box with a label. Line breaks are kept; no formatting. */
export default function TextAreaField({ label, value, onChange, className = '', rows = 5, ...props }: TextAreaFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="form-textarea"
        {...props}
      />
    </div>
  )
}
