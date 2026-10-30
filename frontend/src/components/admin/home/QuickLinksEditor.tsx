import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { homePageKey } from '../../../hooks/admin/homeHook'
import { useCardMutation } from '../../../hooks/admin/parishLifeHook'
import { homeService } from '../../../services/admin/homeService'
import type { QuickLink, QuickLinkForm } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { moveItem } from '../../../utils/array'
import { LINK_TARGET_OPTIONS, LINK_TARGETS } from '../../../utils/homeLinks'
import ConfirmDialog from '../common/ConfirmDialog'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import { SelectField } from '../common/Select'
import StatusBadge from '../common/StatusBadge'
import CardModal, { FieldError } from '../parishLife/CardModal'
import CardRow from '../parishLife/CardRow'
import CardSection from '../parishLife/CardSection'
import { fieldErrorsFrom } from '../parishLife/cardErrors'
import Thumb from '../parishLife/Thumb'

const EMPTY: QuickLinkForm = { title: '', text: '', image: null, linkLabel: 'Learn More', target: 'sacraments' }
type Errors = Partial<Record<keyof QuickLinkForm, string>>
const API_FIELDS = { title: 'title', text: 'text', image: 'image', link_label: 'linkLabel', target: 'target' } as const

/** The photo cards under the upcoming event ("Mass Schedule", "Sacraments", ...), each linking to a page. */
export default function QuickLinksEditor({ links }: { links: QuickLink[] }) {
  const [editing, setEditing] = useState<QuickLink | 'new' | null>(null)
  const [values, setValues] = useState<QuickLinkForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<QuickLink | null>(null)

  const save = useCardMutation(
    ({ card, values }: { card: QuickLink | null; values: QuickLinkForm }) => (card ? homeService.links.update(card, values) : homeService.links.create(values)),
    homePageKey,
  )
  const remove = useCardMutation(homeService.links.remove, homePageKey)
  const reorder = useCardMutation(homeService.links.reorder, homePageKey)

  const open = (card: QuickLink | 'new') => {
    setEditing(card)
    setValues(
      card === 'new'
        ? EMPTY
        : { title: card.title, text: card.text, image: card.image ? { url: card.image } : null, linkLabel: card.linkLabel, target: card.target },
    )
    setErrors({})
  }
  const set = <K extends keyof QuickLinkForm>(key: K, value: QuickLinkForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = () => {
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter a title.'
    if (!values.text.trim()) found.text = 'Enter a short text.'
    if (!values.linkLabel.trim()) found.linkLabel = 'Enter the link text.'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      { card: editing === 'new' ? null : editing, values },
      {
        onSuccess: () => {
          toast.success(editing === 'new' ? 'Card added' : 'Card saved')
          setEditing(null)
        },
        onError: (error) => {
          const fieldErrors = fieldErrorsFrom(error, API_FIELDS)
          if (Object.keys(fieldErrors).length) setErrors(fieldErrors)
          else toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  return (
    <>
      <CardSection
        id="links"
        title="Quick Links"
        subtitle="The photo cards under the upcoming event. Each one opens a page of the website."
        icon={LayoutGrid}
        count={links.length}
        onAdd={() => open('new')}
        emptyText="No cards yet. Add cards such as Mass Schedule or Sacraments."
      >
        {links.map((card, index) => (
          <CardRow
            key={card.id}
            media={<Thumb src={card.image} />}
            title={card.title}
            text={card.text}
            badge={<StatusBadge label={`→ ${LINK_TARGETS[card.target].label.split(' (')[0]}`} tone="info" />}
            isFirst={index === 0}
            isLast={index === links.length - 1}
            onEdit={() => open(card)}
            onDelete={() => setDeleting(card)}
            onMove={(d) =>
              reorder.mutate(moveItem(links, index, index + d).map((l) => l.id), {
                onError: (e) => toast.error(getErrorMessage(e)),
              })
            }
          />
        ))}
      </CardSection>

      <CardModal
        open={editing !== null}
        title={editing === 'new' ? 'Add Quick Link' : 'Edit Quick Link'}
        saving={save.isPending}
        onClose={() => setEditing(null)}
        onSubmit={submit}
      >
        <div>
          <FormField label="Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={60} />
          <FieldError message={errors.title} />
        </div>
        <div>
          <FormField label="Short Text *" value={values.text} onChange={(v) => set('text', v)} maxLength={160} />
          <FieldError message={errors.text} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormField label="Link Text *" value={values.linkLabel} onChange={(v) => set('linkLabel', v)} maxLength={40} placeholder="e.g. Explore" />
            <FieldError message={errors.linkLabel} />
          </div>
          <div>
            <SelectField label="Opens" value={values.target} onChange={(v) => set('target', v as QuickLinkForm['target'])} options={LINK_TARGET_OPTIONS} />
            <FieldError message={errors.target} />
          </div>
        </div>
        <div>
          <p className="form-label">Image</p>
          <ImageUpload value={values.image} onChange={(image) => set('image', image)} alt="Card image" className="h-40" />
          <p className="mt-1 text-xs text-muted">JPG, PNG up to 5MB</p>
          <FieldError message={errors.image} />
        </div>
      </CardModal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete card?"
        message={`“${deleting?.title ?? ''}” will be removed from the Home page, including its image.`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Card deleted')
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  )
}
