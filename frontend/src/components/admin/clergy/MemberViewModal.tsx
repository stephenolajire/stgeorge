import { Mail, Phone } from 'lucide-react'
import type { Member } from '../../../types/admin'
import { CATEGORY_BADGE } from '../../../utils/clergy'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'

interface MemberViewModalProps {
  member: Member | null
  onClose: () => void
  onEdit: (member: Member) => void
}

export default function MemberViewModal({ member, onClose, onEdit }: MemberViewModalProps) {
  if (!member) return null
  const badge = CATEGORY_BADGE[member.category]

  return (
    <Modal
      open
      onClose={onClose}
      title={member.fullName}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(member)}>Edit</Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        {member.photo ? (
          <img src={member.photo} alt="" className="size-20 rounded-lg object-cover" />
        ) : (
          <Avatar name={member.fullName} size="xl" className="rounded-lg bg-surface-muted text-ink" />
        )}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">{member.roleLabel}</p>
          <div className="flex gap-2">
            <StatusBadge label={badge.label} tone={badge.tone} />
            <StatusBadge label={member.isActive ? 'Active' : 'Inactive'} tone={member.isActive ? 'success' : 'neutral'} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink">{member.shortBio}</p>
      {member.description && <p className="mt-2 text-sm whitespace-pre-line text-ink-soft">{member.description}</p>}

      {(member.phone || member.email) && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-ink-soft">
          {member.phone && (
            <p className="flex items-center gap-2">
              <Phone className="size-4" /> {member.phone}
            </p>
          )}
          {member.email && (
            <p className="flex items-center gap-2">
              <Mail className="size-4" /> {member.email}
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
