import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { buttonBase, buttonStyles, type ButtonVariant } from '../../../utils/buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${buttonBase} ${buttonStyles[variant]} ${className}`} {...props} />
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  /** Open in a new tab. */
  external?: boolean
}

/** A link styled as a button. */
export function ButtonLink({ variant = 'primary', external, className = '', ...props }: ButtonLinkProps) {
  return (
    <a
      className={`${buttonBase} ${buttonStyles[variant]} ${className}`}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...props}
    />
  )
}
