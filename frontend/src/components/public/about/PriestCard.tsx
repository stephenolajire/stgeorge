import type { Member } from '../../../types/admin'
import { getInitials } from '../../../utils/format'

interface PriestCardProps {
  member: Member
  /** Shown after "Bishop", e.g. "Catholic Diocese of Osogbo". */
  diocese: string
}

export default function PriestCard({ member, diocese }: PriestCardProps) {
  const role = member.role === 'bishop' && diocese ? `${member.roleLabel}, ${diocese}` : member.roleLabel

  return (
    <article className="flex items-center gap-5 rounded-lg bg-surface p-3 pr-5 shadow-card">
      <div className="size-27 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-accent-light to-accent">
        {member.photo ? (
          <img src={member.photo} alt={member.fullName} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-display text-2xl font-bold text-primary">
            {getInitials(member.fullName)}
          </span>
        )}
      </div>
      <div className="min-w-0 wrap-anywhere">
        <h3 className="font-display text-[0.9375rem] font-bold text-primary">{member.fullName}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">{role}</p>
        <span className="mt-3 block h-0.5 w-8 bg-accent" />
        <p className="mt-2.5 font-display text-xs leading-relaxed text-muted italic">“{member.shortBio}”</p>
      </div>
    </article>
  )
}
