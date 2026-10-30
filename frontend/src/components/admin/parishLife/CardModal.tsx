import { Save } from 'lucide-react'
import { useId, type FormEvent, type ReactNode } from 'react'
import Button from '../common/Button'
import Modal from '../common/Modal'

interface CardModalProps {
  open: boolean
  title: string
  saving: boolean
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}

/** Popup form for adding or editing a card. Saving happens straight away (not with the page's Save Changes). */
export default function CardModal({ open, title, saving, onClose, onSubmit, children }: CardModalProps) {
  const formId = useId()
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            <Save className="size-4" /> {saving ? 'Saving...' : 'Save Card'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        {children}
      </form>
    </Modal>
  )
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-danger">{message}</p> : null
}
