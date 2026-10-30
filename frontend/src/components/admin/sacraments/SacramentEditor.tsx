import { isAxiosError } from 'axios'
import { EllipsisVertical, Eye, Save, Trash2, Wine } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useSaveSacrament } from '../../../hooks/admin/sacramentsHook'
import type { Sacrament, SacramentForm, SacramentIcon } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { PUBLISH_STATUS_OPTIONS } from '../../../utils/publishStatus'
import { SACRAMENT_ICONS } from '../../../utils/sacramentIcons'
import Button from '../common/Button'
import FormField from '../common/FormField'
import ImagePickerField from '../common/ImagePickerField'
import MoreMenu from '../common/MoreMenu'
import StatusPillSelect from '../common/StatusPillSelect'
import TextAreaField from '../common/TextAreaField'

const EMPTY: SacramentForm = { title: '', icon: 'cross', shortDescription: '', content: '', image: null, isPublished: true }
type Errors = Partial<Record<keyof SacramentForm, string>>
const API_FIELDS: Record<string, keyof SacramentForm> = {
  title: 'title',
  icon: 'icon',
  short_description: 'shortDescription',
  content: 'content',
  image: 'image',
  is_published: 'isPublished',
}

const toForm = (s: Sacrament): SacramentForm => ({
  title: s.title,
  icon: s.icon,
  shortDescription: s.shortDescription,
  content: s.content,
  image: s.image ? { url: s.image } : null,
  isPublished: s.isPublished,
})

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-danger">{message}</p> : null
}

interface SacramentEditorProps {
  /** The sacrament being edited, or null to add a new one. */
  sacrament: Sacrament | null
  onSaved: (sacrament: Sacrament) => void
  onDelete: (sacrament: Sacrament) => void
  onPreview: (sacrament: Sacrament) => void
  onCancel: () => void
}

/** Right-hand panel for adding or editing a sacrament. Remount it (with a key) to switch sacrament. */
export default function SacramentEditor({ sacrament, onSaved, onDelete, onPreview, onCancel }: SacramentEditorProps) {
  const [values, setValues] = useState<SacramentForm>(sacrament ? toForm(sacrament) : EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const { mutate: save, isPending } = useSaveSacrament()

  const set = <K extends keyof SacramentForm>(key: K, value: SacramentForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter the title.'
    if (!values.shortDescription.trim()) found.shortDescription = 'Enter a short description.'
    if (!values.content.trim()) found.content = 'Enter the content.'
    setErrors(found)
    if (Object.keys(found).length) return

    save(
      { sacrament, values },
      {
        onSuccess: (saved) => {
          toast.success(sacrament ? 'Changes saved' : 'Sacrament added')
          onSaved(saved)
        },
        onError: (error) => {
          const data = isAxiosError(error) ? error.response?.data : null
          if (data && typeof data === 'object') {
            const fieldErrors: Errors = {}
            for (const [field, messages] of Object.entries(data)) {
              const key = API_FIELDS[field]
              if (key) fieldErrors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
            }
            if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)
          }
          toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  const handleCancel = () => {
    setValues(sacrament ? toForm(sacrament) : EMPTY)
    setErrors({})
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col p-4 pt-3.5" noValidate>
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <Wine className="mt-1 size-5.5 shrink-0 text-ink" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{sacrament ? 'Edit Sacrament' : 'Add Sacrament'}</h2>
            <p className="text-[0.8125rem] text-muted">
              {sacrament ? 'Update the details for this sacrament.' : 'Add a sacrament to the website.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusPillSelect
            value={values.isPublished ? 'published' : 'draft'}
            onChange={(v) => set('isPublished', v === 'published')}
            options={PUBLISH_STATUS_OPTIONS}
          />
          {sacrament && (
            <MoreMenu
              label="Sacrament actions"
              icon={EllipsisVertical}
              buttonClassName="flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-surface-muted"
              items={[{ label: 'Preview', icon: Eye, onClick: () => onPreview(sacrament) }]}
            />
          )}
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <FormField label="Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={120} />
          <FieldError message={errors.title} />
        </div>
        <fieldset>
          <legend className="form-label">Icon</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {(Object.keys(SACRAMENT_ICONS) as SacramentIcon[]).map((key) => {
              const { icon: Icon, label, color } = SACRAMENT_ICONS[key]
              const selected = values.icon === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('icon', key)}
                  aria-pressed={selected}
                  title={label}
                  className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[0.6875rem] transition ${
                    selected ? 'border-brand bg-brand-soft text-ink' : 'border-field-border text-ink-soft hover:bg-surface-muted'
                  }`}
                >
                  <Icon className={`size-5 ${color}`} />
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
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
          <p className="mt-1 text-xs text-muted">Leave a blank line between paragraphs.</p>
          <FieldError message={errors.content} />
        </div>
        <ImagePickerField value={values.image} onChange={(image) => set('image', image)} error={errors.image} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {sacrament && (
          <Button variant="danger" onClick={() => onDelete(sacrament)} className="mr-auto">
            <Trash2 className="size-4" /> Delete Sacrament
          </Button>
        )}
        <Button variant="outline" onClick={handleCancel} className={sacrament ? '' : 'ml-auto'}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" /> {isPending ? 'Saving...' : sacrament ? 'Save Changes' : 'Add Sacrament'}
        </Button>
      </div>
    </form>
  )
}
