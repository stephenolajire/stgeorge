import type { Sacrament } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Button from '../common/Button'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'

interface SacramentPreviewModalProps {
  sacrament: Sacrament | null
  onClose: () => void
  onEdit: (sacrament: Sacrament) => void
}

export default function SacramentPreviewModal({ sacrament, onClose, onEdit }: SacramentPreviewModalProps) {
  if (!sacrament) return null
  return (
    <Modal
      open
      onClose={onClose}
      title={sacrament.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(sacrament)}>Edit</Button>
        </>
      }
    >
      {sacrament.image && <img src={sacrament.image} alt="" className="mb-4 aspect-[2/1] w-full rounded-md object-cover" />}
      <StatusBadge label={sacrament.isPublished ? 'Published' : 'Draft'} tone={sacrament.isPublished ? 'success' : 'neutral'} />
      <p className="mt-3 text-sm font-medium text-ink">{sacrament.shortDescription}</p>
      <div className="mt-3 max-h-64 space-y-2.5 overflow-y-auto text-sm leading-relaxed text-ink-soft">
        {toParagraphs(sacrament.content).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </Modal>
  )
}
