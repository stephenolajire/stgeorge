import { isAxiosError } from 'axios'
import { CalendarDays, Clock, EllipsisVertical, Eye, Newspaper, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useSavePost } from '../../../hooks/admin/newsEventsHook'
import type { CategoryOption, EventItem, NewsItem, PostForm, PostKind } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { parishParts, parishToday } from '../../../utils/newsEvents'
import { PUBLISH_STATUS_OPTIONS } from '../../../utils/publishStatus'
import Button from '../common/Button'
import FormField from '../common/FormField'
import ImagePickerField from '../common/ImagePickerField'
import MoreMenu from '../common/MoreMenu'
import { SelectField } from '../common/Select'
import StatusPillSelect from '../common/StatusPillSelect'
import Switch from '../common/Switch'
import TextAreaField from '../common/TextAreaField'

type Errors = Partial<Record<keyof PostForm, string>>
const API_FIELDS: Record<string, keyof PostForm> = {
  title: 'title',
  short_description: 'shortDescription',
  content: 'content',
  category: 'category',
  image: 'image',
  starts_at: 'date',
  published_on: 'date',
  location: 'location',
}

function toForm(kind: PostKind, item: EventItem | NewsItem | null, categories: CategoryOption[]): PostForm {
  if (!item) {
    return {
      title: '',
      shortDescription: '',
      content: '',
      category: categories[0]?.value ?? 'other',
      image: null,
      isPublished: true,
      isFeatured: false,
      date: kind === 'news' ? parishToday() : '',
      time: kind === 'events' ? '09:00' : '',
      location: '',
    }
  }
  const when = 'startsAt' in item ? parishParts(item.startsAt) : null
  return {
    title: item.title,
    shortDescription: item.shortDescription,
    content: item.content,
    category: item.category,
    image: item.image ? { url: item.image } : null,
    isPublished: item.isPublished,
    isFeatured: item.isFeatured,
    date: when ? when.date : (item as NewsItem).publishedOn,
    time: when ? when.time : '',
    location: 'location' in item ? item.location : '',
  }
}

interface PostEditorProps {
  kind: PostKind
  /** The item being edited, or null to add one. */
  item: EventItem | NewsItem | null
  categories: CategoryOption[]
  onSaved: (item: EventItem | NewsItem) => void
  onDelete: (item: EventItem | NewsItem) => void
  onPreview: (item: EventItem | NewsItem) => void
  onCancel: () => void
}

/** Right-hand panel for adding or editing an event or a news post. Remount it (with a key) to switch item. */
export default function PostEditor({ kind, item, categories, onSaved, onDelete, onPreview, onCancel }: PostEditorProps) {
  const isEvent = kind === 'events'
  const noun = isEvent ? 'Event' : 'News Post'
  const [values, setValues] = useState<PostForm>(() => toForm(kind, item, categories))
  const [errors, setErrors] = useState<Errors>({})
  const { mutate: save, isPending } = useSavePost()

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter a title.'
    if (!values.shortDescription.trim()) found.shortDescription = 'Enter a short description.'
    if (!values.content.trim()) found.content = 'Enter the full content.'
    if (!values.date) found.date = isEvent ? 'Choose the date.' : 'Choose the publish date.'
    setErrors(found)
    if (Object.keys(found).length) return
    save(
      { kind, item, values },
      {
        onSuccess: (saved) => {
          toast.success(item ? 'Changes saved' : `${noun} added`)
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

  const err = (key: keyof PostForm) => errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>
  const HeaderIcon = isEvent ? CalendarDays : Newspaper

  return (
    <form onSubmit={submit} noValidate className="card flex flex-col p-4 pt-3.5">
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <HeaderIcon className="mt-1 size-5.5 shrink-0 text-ink" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{item ? `Edit ${noun}` : `Add ${noun}`}</h2>
            <p className="text-[0.8125rem] text-muted">{item ? `Update the ${isEvent ? 'event' : 'post'} details and settings.` : `Add a new ${isEvent ? 'event' : 'news post'}.`}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusPillSelect value={values.isPublished ? 'published' : 'draft'} onChange={(v) => set('isPublished', v === 'published')} options={PUBLISH_STATUS_OPTIONS} />
          {item && (
            <MoreMenu
              label={`${noun} actions`}
              icon={EllipsisVertical}
              buttonClassName="flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-surface-muted"
              items={[{ label: 'Preview', icon: Eye, onClick: () => onPreview(item) }]}
            />
          )}
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <FormField label="Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={150} />
          {err('title')}
        </div>
        <div>
          <TextAreaField label="Short Description *" value={values.shortDescription} onChange={(v) => set('shortDescription', v)} rows={2} maxLength={300} />
          {err('shortDescription')}
        </div>
        <div>
          <TextAreaField label="Full Content *" value={values.content} onChange={(v) => set('content', v)} rows={5} maxLength={10000} />
          <p className="mt-1 text-xs text-muted">Leave a blank line between paragraphs.</p>
          {err('content')}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isEvent ? (
            <div>
              <p className="form-label">Date &amp; Time</p>
              <div className="space-y-2">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                  <input type="date" aria-label="Date" value={values.date} onChange={(e) => set('date', e.target.value)} className="form-input pl-9" />
                </div>
                <div className="relative">
                  <Clock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                  <input type="time" aria-label="Time" value={values.time} onChange={(e) => set('time', e.target.value)} className="form-input pl-9" />
                </div>
              </div>
              {err('date')}
            </div>
          ) : (
            <div>
              <label htmlFor="publish-date" className="form-label">
                Publish Date
              </label>
              <input id="publish-date" type="date" value={values.date} onChange={(e) => set('date', e.target.value)} className="form-input" />
              <p className="mt-1 text-xs text-muted">A future date keeps the post hidden until then.</p>
              {err('date')}
            </div>
          )}
          {isEvent && <FormField label="Location" value={values.location} onChange={(v) => set('location', v)} maxLength={200} placeholder="e.g. Parish Hall, Ofatedo" />}
          <SelectField label="Category" value={values.category} onChange={(v) => set('category', v)} options={categories} />
          <ImagePickerField label="Featured Image" value={values.image} onChange={(image) => set('image', image)} error={errors.image} className="h-28" />
        </div>

        <Switch
          checked={values.isFeatured}
          onChange={(on) => set('isFeatured', on)}
          label={isEvent ? 'Featured Event' : 'Featured Post'}
          description={`This ${isEvent ? 'event' : 'post'} will be highlighted on the homepage.`}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5 [&>button]:px-3.5">
        {item && (
          <Button variant="danger" onClick={() => onDelete(item)} className="mr-auto">
            <Trash2 className="size-4" /> Delete {isEvent ? 'Event' : 'Post'}
          </Button>
        )}
        <Button
          variant="outline"
          className={item ? '' : 'ml-auto'}
          onClick={() => {
            setValues(toForm(kind, item, categories))
            setErrors({})
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" /> {isPending ? 'Saving...' : item ? 'Save Changes' : `Add ${isEvent ? 'Event' : 'Post'}`}
        </Button>
      </div>
    </form>
  )
}
