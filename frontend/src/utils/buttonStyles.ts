export type ButtonVariant = 'primary' | 'outline' | 'secondary'

export const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  outline: 'border border-brand bg-surface text-brand hover:bg-brand-soft',
  secondary: 'border border-field-border bg-surface text-ink hover:bg-surface-muted',
}

export const buttonBase =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4.5 text-[0.8125rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'
