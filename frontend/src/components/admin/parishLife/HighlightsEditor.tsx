import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useCardMutation } from '../../../hooks/admin/parishLifeHook'
import type { Highlight, HighlightForm, HighlightIcon } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { moveItem } from '../../../utils/array'
import { HIGHLIGHT_ICONS } from '../../../utils/highlightIcons'
import ConfirmDialog from '../common/ConfirmDialog'
import FormField from '../common/FormField'
import CardModal, { FieldError } from './CardModal'
import CardRow from './CardRow'
import CardSection from './CardSection'
import { fieldErrorsFrom } from './cardErrors'
import IconBadge from './IconBadge'

const EMPTY: HighlightForm = { title: '', text: '', icon: 'church' }
type Errors = Partial<Record<keyof HighlightForm, string>>

/** The calls a set of icon cards is saved with (Parish Life highlights, Sacraments features). */
export interface IconCardApi {
  create: (values: HighlightForm) => Promise<unknown>
  update: (id: number, values: HighlightForm) => Promise<unknown>
  remove: (id: number) => Promise<void>
  reorder: (ids: number[]) => Promise<void>
}

interface HighlightsEditorProps {
  highlights: Highlight[]
  api: IconCardApi
  /** Query to refresh after a change. */
  queryKey: readonly unknown[]
  id?: string
  title?: string
  subtitle?: string
  /** Word used in messages, e.g. "Highlight" or "Feature". */
  noun?: string
}

/** Section of small icon cards (title, short text, icon) with Add Card, edit, delete and reorder. */
export default function HighlightsEditor({
  highlights,
  api,
  queryKey,
  id = 'highlights',
  title = 'Highlights',
  subtitle = 'The row of small cards under the banner.',
  noun = 'Highlight',
}: HighlightsEditorProps) {
  const [editing, setEditing] = useState<Highlight | 'new' | null>(null)
  const [values, setValues] = useState<HighlightForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<Highlight | null>(null)

  const save = useCardMutation(
    ({ id, values }: { id?: number; values: HighlightForm }) => (id ? api.update(id, values) : api.create(values)),
    queryKey,
  )
  const remove = useCardMutation(api.remove, queryKey)
  const reorder = useCardMutation(api.reorder, queryKey)

  const open = (card: Highlight | 'new') => {
    setEditing(card)
    setValues(card === 'new' ? EMPTY : { title: card.title, text: card.text, icon: card.icon })
    setErrors({})
  }
  const set = <K extends keyof HighlightForm>(key: K, value: HighlightForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = () => {
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter a title.'
    if (!values.text.trim()) found.text = 'Enter a short text.'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      { id: editing === 'new' ? undefined : editing?.id, values },
      {
        onSuccess: () => {
          toast.success(editing === 'new' ? `${noun} added` : `${noun} saved`)
          setEditing(null)
        },
        onError: (error) => {
          const fieldErrors = fieldErrorsFrom(error, { title: 'title', text: 'text', icon: 'icon' } as const)
          if (Object.keys(fieldErrors).length) setErrors(fieldErrors)
          else toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  return (
    <>
      <CardSection
        id={id}
        title={title}
        subtitle={subtitle}
        icon={Sparkles}
        count={highlights.length}
        onAdd={() => open('new')}
        emptyText="No cards yet."
      >
        {highlights.map((card, index) => (
          <CardRow
            key={card.id}
            media={<IconBadge icon={card.icon} />}
            title={card.title}
            text={card.text}
            isFirst={index === 0}
            isLast={index === highlights.length - 1}
            onEdit={() => open(card)}
            onDelete={() => setDeleting(card)}
            onMove={(d) =>
              reorder.mutate(moveItem(highlights, index, index + d).map((h) => h.id), {
                onError: (e) => toast.error(getErrorMessage(e)),
              })
            }
          />
        ))}
      </CardSection>

      <CardModal
        open={editing !== null}
        title={editing === 'new' ? `Add ${noun}` : `Edit ${noun}`}
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
        <fieldset>
          <legend className="form-label">Icon</legend>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(HIGHLIGHT_ICONS) as HighlightIcon[]).map((key) => {
              const { icon: Icon, label } = HIGHLIGHT_ICONS[key]
              const selected = values.icon === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('icon', key)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2.5 text-[0.6875rem] transition ${
                    selected ? 'border-brand bg-brand-soft text-brand' : 'border-field-border text-ink-soft hover:bg-surface-muted'
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </CardModal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${noun.toLowerCase()}?`}
        message={`“${deleting?.title ?? ''}” will be removed from the page.`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(`${noun} deleted`)
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  )
}
