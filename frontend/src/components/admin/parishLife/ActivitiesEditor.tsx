import { CircleCheck, CircleDashed, HeartHandshake } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useCardMutation } from '../../../hooks/admin/parishLifeHook'
import { parishLifeService } from '../../../services/admin/parishLifeService'
import type { Activity, ActivityForm } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { moveItem } from '../../../utils/array'
import ConfirmDialog from '../common/ConfirmDialog'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import { SelectField } from '../common/Select'
import StatusBadge from '../common/StatusBadge'
import TextAreaField from '../common/TextAreaField'
import CardModal, { FieldError } from './CardModal'
import CardRow from './CardRow'
import CardSection from './CardSection'
import { fieldErrorsFrom } from './cardErrors'
import Thumb from './Thumb'

const EMPTY: ActivityForm = { title: '', shortDescription: '', content: '', image: null, isPublished: true }
type Errors = Partial<Record<keyof ActivityForm, string>>
const API_FIELDS = {
  title: 'title',
  short_description: 'shortDescription',
  content: 'content',
  image: 'image',
  is_published: 'isPublished',
} as const

export default function ActivitiesEditor({ activities }: { activities: Activity[] }) {
  const [editing, setEditing] = useState<Activity | 'new' | null>(null)
  const [values, setValues] = useState<ActivityForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<Activity | null>(null)

  const save = useCardMutation(({ card, values }: { card: Activity | null; values: ActivityForm }) =>
    card ? parishLifeService.activities.update(card, values) : parishLifeService.activities.create(values),
  )
  const remove = useCardMutation(parishLifeService.activities.remove)
  const reorder = useCardMutation(parishLifeService.activities.reorder)
  const togglePublished = useCardMutation((card: Activity) =>
    parishLifeService.activities.update(card, {
      title: card.title,
      shortDescription: card.shortDescription,
      content: card.content,
      image: card.image ? { url: card.image } : null,
      isPublished: !card.isPublished,
    }),
  )

  const open = (card: Activity | 'new') => {
    setEditing(card)
    setValues(
      card === 'new'
        ? EMPTY
        : {
            title: card.title,
            shortDescription: card.shortDescription,
            content: card.content,
            image: card.image ? { url: card.image } : null,
            isPublished: card.isPublished,
          },
    )
    setErrors({})
  }
  const set = <K extends keyof ActivityForm>(key: K, value: ActivityForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = () => {
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter a title.'
    if (!values.shortDescription.trim()) found.shortDescription = 'Enter a short description.'
    if (!values.content.trim()) found.content = 'Enter the content.'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      { card: editing === 'new' ? null : editing, values },
      {
        onSuccess: () => {
          toast.success(editing === 'new' ? 'Activity added' : 'Activity saved')
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
        id="activities"
        title="Activities"
        subtitle={'The "Growing Together in Faith" cards. Visitors can open a card to read its content.'}
        icon={HeartHandshake}
        count={activities.length}
        onAdd={() => open('new')}
        emptyText="No activities yet. Add cards such as Bible Sharing or Holy Rosary."
      >
        {activities.map((card, index) => (
          <CardRow
            key={card.id}
            media={<Thumb src={card.image} />}
            title={card.title}
            text={card.shortDescription}
            badge={<StatusBadge label={card.isPublished ? 'Published' : 'Draft'} tone={card.isPublished ? 'success' : 'neutral'} />}
            isFirst={index === 0}
            isLast={index === activities.length - 1}
            onEdit={() => open(card)}
            onDelete={() => setDeleting(card)}
            onMove={(d) =>
              reorder.mutate(moveItem(activities, index, index + d).map((a) => a.id), {
                onError: (e) => toast.error(getErrorMessage(e)),
              })
            }
            extraMenuItems={[
              card.isPublished
                ? { label: 'Unpublish (draft)', icon: CircleDashed, onClick: () => togglePublished.mutate(card) }
                : { label: 'Publish', icon: CircleCheck, onClick: () => togglePublished.mutate(card) },
            ]}
          />
        ))}
      </CardSection>

      <CardModal
        open={editing !== null}
        title={editing === 'new' ? 'Add Activity' : 'Edit Activity'}
        saving={save.isPending}
        onClose={() => setEditing(null)}
        onSubmit={submit}
      >
        <div>
          <FormField label="Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={150} />
          <FieldError message={errors.title} />
        </div>
        <div>
          <TextAreaField
            label="Short Description *"
            value={values.shortDescription}
            onChange={(v) => set('shortDescription', v)}
            rows={2}
            maxLength={300}
          />
          <FieldError message={errors.shortDescription} />
        </div>
        <div>
          <TextAreaField label="Content *" value={values.content} onChange={(v) => set('content', v)} rows={6} maxLength={10000} />
          <p className="mt-1 text-xs text-muted">Shown when a visitor opens the card. Leave a blank line between paragraphs.</p>
          <FieldError message={errors.content} />
        </div>
        <div>
          <p className="form-label">Image</p>
          <ImageUpload value={values.image} onChange={(image) => set('image', image)} alt="Activity image" className="h-40" />
          <p className="mt-1 text-xs text-muted">JPG, PNG up to 5MB</p>
          <FieldError message={errors.image} />
        </div>
        <SelectField
          label="Status"
          value={values.isPublished ? 'published' : 'draft'}
          onChange={(v) => set('isPublished', v === 'published')}
          options={[
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft (hidden from visitors)' },
          ]}
        />
      </CardModal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete activity?"
        message={`“${deleting?.title ?? ''}” will be removed permanently, including its image.`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Activity deleted')
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  )
}
