import { isAxiosError } from 'axios'
import { CalendarDays, Image as ImageIcon, ImagePlus, Save, Trash2, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useUpdatePhoto } from '../../../hooks/admin/galleryHook'
import type { Photo, PhotoForm } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { GALLERY_CATEGORIES, PHOTO_MAX_MB, PHOTO_TYPES } from '../../../utils/gallery'
import Button from '../common/Button'
import FormField from '../common/FormField'
import { SelectField } from '../common/Select'
import TextAreaField from '../common/TextAreaField'

const toForm = (p: Photo): PhotoForm => ({
  title: p.title,
  category: p.category,
  description: p.description,
  dateTaken: p.dateTaken,
  tags: p.tags,
  image: { url: p.image },
})

const API_FIELDS: Record<string, keyof PhotoForm> = {
  title: 'title',
  category: 'category',
  description: 'description',
  date_taken: 'dateTaken',
  tags: 'tags',
  image: 'image',
}

interface PhotoDetailsPanelProps {
  photo: Photo | null
  onClose: () => void
  onDelete: (photo: Photo) => void
  onSaved: (photo: Photo) => void
}

/** Right-hand "Photo Details" panel. Remount it (with a key) to switch photo. */
export default function PhotoDetailsPanel({ photo, onClose, onDelete, onSaved }: PhotoDetailsPanelProps) {
  const [values, setValues] = useState<PhotoForm | null>(photo ? toForm(photo) : null)
  const [errors, setErrors] = useState<Partial<Record<keyof PhotoForm, string>>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: save, isPending } = useUpdatePhoto()

  if (!photo || !values) {
    return (
      <aside className="card flex flex-col items-center px-6 py-16 text-center">
        <ImagePlus className="size-10 text-muted" strokeWidth={1.5} />
        <p className="mt-3 font-display text-base font-bold text-ink">Photo Details</p>
        <p className="mt-1 text-sm text-muted">Click a photo to see and edit its details.</p>
      </aside>
    )
  }

  const set = <K extends keyof PhotoForm>(key: K, value: PhotoForm[K]) => {
    setValues((v) => (v ? { ...v, [key]: value } : v))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const pickImage = (file: File | undefined) => {
    if (!file) return
    if (!PHOTO_TYPES.includes(file.type)) return void toast.error('Please choose a JPG, PNG or WebP image.')
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) return void toast.error(`The photo must be ${PHOTO_MAX_MB} MB or smaller.`)
    if (values.image.url.startsWith('blob:')) URL.revokeObjectURL(values.image.url)
    set('image', { url: URL.createObjectURL(file), file })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.title.trim()) return setErrors({ title: 'Enter a title.' })
    save(
      { photo, values },
      {
        onSuccess: (saved) => {
          toast.success('Photo details saved')
          onSaved(saved)
        },
        onError: (error) => {
          const data = isAxiosError(error) ? error.response?.data : null
          if (data && typeof data === 'object') {
            const found: Partial<Record<keyof PhotoForm, string>> = {}
            for (const [field, messages] of Object.entries(data)) {
              const key = API_FIELDS[field]
              if (key) found[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
            }
            if (Object.keys(found).length) return setErrors(found)
          }
          toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col p-4 pt-3.5">
      <header className="mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Photo Details</h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-soft hover:bg-surface-muted" aria-label="Close details">
          <X className="size-5" />
        </button>
      </header>

      <div className="relative overflow-hidden rounded-md">
        <img src={values.image.url} alt={values.title} className="aspect-[16/9] w-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(photo)}
          className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-md bg-surface text-ink shadow-card hover:text-danger"
          aria-label="Delete photo"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          pickImage(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2.5 inline-flex h-9.5 w-full items-center justify-center gap-2 rounded-md border border-brand text-[0.8125rem] font-medium text-brand hover:bg-brand-soft"
      >
        <ImageIcon className="size-4" /> Change Image
      </button>
      {errors.image && <p className="mt-1 text-xs text-danger">{errors.image}</p>}

      <div className="mt-4 space-y-4">
        <div>
          <FormField label="Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={150} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title}</p>}
        </div>
        <SelectField
          label="Category *"
          value={values.category}
          onChange={(v) => set('category', v as PhotoForm['category'])}
          options={GALLERY_CATEGORIES}
        />
        <TextAreaField
          label="Short Description"
          value={values.description}
          onChange={(v) => set('description', v)}
          rows={3}
          maxLength={500}
        />
        <div>
          <label htmlFor="photo-date" className="form-label">
            Date Taken
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              id="photo-date"
              type="date"
              value={values.dateTaken}
              onChange={(e) => set('dateTaken', e.target.value)}
              className="form-input pl-9"
            />
          </div>
          {errors.dateTaken && <p className="mt-1 text-xs text-danger">{errors.dateTaken}</p>}
        </div>
        <div>
          <FormField
            label="Tags (optional)"
            value={values.tags}
            onChange={(v) => set('tags', v)}
            placeholder="e.g. mass, worship, altar"
            maxLength={300}
          />
          <p className="mt-1.5 text-xs text-muted">Separate tags with commas</p>
        </div>
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setValues(toForm(photo))
            setErrors({})
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" /> {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
