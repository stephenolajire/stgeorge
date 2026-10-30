import { getInitials } from '../../../utils/format'

interface AvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md'
  className?: string
}

const sizes = {
  sm: 'size-9 text-xs',
  md: 'size-10 text-sm',
}

export default function Avatar({ name, imageUrl, size = 'md', className = 'bg-accent/20 text-ink' }: AvatarProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  }
  return (
    <span
      className={`${sizes[size]} ${className} inline-flex shrink-0 items-center justify-center rounded-full font-semibold`}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}
