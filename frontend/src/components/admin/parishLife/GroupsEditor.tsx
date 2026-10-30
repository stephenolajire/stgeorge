import { CircleCheck, CircleOff, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { parishGroupsKey, useCardMutation } from '../../../hooks/admin/parishLifeHook'
import { parishGroupsService } from '../../../services/admin/parishGroupsService'
import type { ParishGroup, ParishGroupForm } from '../../../types/admin'
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

const EMPTY: ParishGroupForm = { name: '', description: '', image: null, isActive: true }
type Errors = Partial<Record<keyof ParishGroupForm, string>>
const API_FIELDS = { name: 'name', description: 'description', image: 'image', is_active: 'isActive' } as const

const toForm = (g: ParishGroup): ParishGroupForm => ({
  name: g.name,
  description: g.description,
  image: g.image ? { url: g.image } : null,
  isActive: g.isActive,
})

export default function GroupsEditor({ groups }: { groups: ParishGroup[] }) {
  const [editing, setEditing] = useState<ParishGroup | 'new' | null>(null)
  const [values, setValues] = useState<ParishGroupForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<ParishGroup | null>(null)

  const save = useCardMutation(
    ({ card, values }: { card: ParishGroup | null; values: ParishGroupForm }) =>
      card ? parishGroupsService.update(card, values) : parishGroupsService.create(values),
    parishGroupsKey,
  )
  const remove = useCardMutation(parishGroupsService.remove, parishGroupsKey)
  const reorder = useCardMutation(parishGroupsService.reorder, parishGroupsKey)
  const toggleActive = useCardMutation(
    (g: ParishGroup) => parishGroupsService.update(g, { ...toForm(g), isActive: !g.isActive }),
    parishGroupsKey,
  )

  const open = (card: ParishGroup | 'new') => {
    setEditing(card)
    setValues(card === 'new' ? EMPTY : toForm(card))
    setErrors({})
  }
  const set = <K extends keyof ParishGroupForm>(key: K, value: ParishGroupForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = () => {
    const found: Errors = {}
    if (!values.name.trim()) found.name = 'Enter the group name.'
    if (!values.description.trim()) found.description = 'Enter a short description.'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      { card: editing === 'new' ? null : editing, values },
      {
        onSuccess: () => {
          toast.success(editing === 'new' ? 'Group added' : 'Group saved')
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
        id="groups"
        title="Parish Groups"
        subtitle={'The "Communities Within Our Parish" cards.'}
        icon={Users}
        count={groups.length}
        onAdd={() => open('new')}
        emptyText="No groups yet. Add cards such as Altar Servers, Choir or CWO."
      >
        {groups.map((card, index) => (
          <CardRow
            key={card.id}
            media={<Thumb src={card.image} />}
            title={card.name}
            text={card.description}
            badge={<StatusBadge label={card.isActive ? 'Active' : 'Hidden'} tone={card.isActive ? 'success' : 'neutral'} />}
            isFirst={index === 0}
            isLast={index === groups.length - 1}
            onEdit={() => open(card)}
            onDelete={() => setDeleting(card)}
            onMove={(d) =>
              reorder.mutate(moveItem(groups, index, index + d).map((g) => g.id), {
                onError: (e) => toast.error(getErrorMessage(e)),
              })
            }
            extraMenuItems={[
              card.isActive
                ? { label: 'Hide from website', icon: CircleOff, onClick: () => toggleActive.mutate(card) }
                : { label: 'Show on website', icon: CircleCheck, onClick: () => toggleActive.mutate(card) },
            ]}
          />
        ))}
      </CardSection>

      <CardModal
        open={editing !== null}
        title={editing === 'new' ? 'Add Parish Group' : 'Edit Parish Group'}
        saving={save.isPending}
        onClose={() => setEditing(null)}
        onSubmit={submit}
      >
        <div>
          <FormField label="Group Name *" value={values.name} onChange={(v) => set('name', v)} maxLength={120} />
          <FieldError message={errors.name} />
        </div>
        <div>
          <TextAreaField
            label="Short Description *"
            value={values.description}
            onChange={(v) => set('description', v)}
            rows={3}
            maxLength={300}
          />
          <FieldError message={errors.description} />
        </div>
        <div>
          <p className="form-label">Image</p>
          <ImageUpload value={values.image} onChange={(image) => set('image', image)} alt="Group image" className="h-40" />
          <p className="mt-1 text-xs text-muted">JPG, PNG up to 5MB</p>
          <FieldError message={errors.image} />
        </div>
        <SelectField
          label="Status"
          value={values.isActive ? 'active' : 'hidden'}
          onChange={(v) => set('isActive', v === 'active')}
          options={[
            { value: 'active', label: 'Active (shown on the website)' },
            { value: 'hidden', label: 'Hidden' },
          ]}
        />
      </CardModal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete group?"
        message={`“${deleting?.name ?? ''}” will be removed permanently, including its image.`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Group deleted')
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  )
}
