interface CountBadgeProps {
  count: number
  className?: string
}

export default function CountBadge({ count, className = '' }: CountBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded-full bg-danger text-[0.6875rem] font-semibold text-white ${className}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}
