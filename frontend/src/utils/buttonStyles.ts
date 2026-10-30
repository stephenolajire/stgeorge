export type ButtonVariant = 'primary' | 'brand' | 'outline' | 'secondary' | 'danger' | 'destructive'

export const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  brand: 'bg-brand text-white hover:bg-brand-hover',
  outline: 'border border-brand bg-surface text-brand hover:bg-brand-soft',
  secondary: 'border border-field-border bg-surface text-ink hover:bg-surface-muted',
  danger: 'border border-danger bg-surface text-danger hover:bg-danger-soft',
  destructive: 'bg-danger text-white hover:brightness-95',
}

export const buttonBase =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4.5 text-[0.8125rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'
