import { CircleHelp, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { contactKeys } from '../../../hooks/admin/contactHook'
import { useCardMutation } from '../../../hooks/admin/parishLifeHook'
import { contactService } from '../../../services/admin/contactService'
import type { FAQ } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { moveItem } from '../../../utils/array'
import ConfirmDialog from '../common/ConfirmDialog'
import FormField from '../common/FormField'
import TextAreaField from '../common/TextAreaField'
import CardModal, { FieldError } from '../parishLife/CardModal'
import CardRow from '../parishLife/CardRow'
import CardSection from '../parishLife/CardSection'

const EMPTY = { question: '', answer: '' }

/** "Quick Questions" cards: Add Card, edit, delete and reorder. Saved straight away. */
export default function FaqEditor({ faqs }: { faqs: FAQ[] }) {
  const [editing, setEditing] = useState<FAQ | 'new' | null>(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({})
  const [deleting, setDeleting] = useState<FAQ | null>(null)

  const save = useCardMutation(
    ({ id, values }: { id?: number; values: typeof EMPTY }) => (id ? contactService.faqs.update(id, values) : contactService.faqs.create(values)),
    contactKeys.page,
  )
  const remove = useCardMutation(contactService.faqs.remove, contactKeys.page)
  const reorder = useCardMutation(contactService.faqs.reorder, contactKeys.page)

  const open = (faq: FAQ | 'new') => {
    setEditing(faq)
    setValues(faq === 'new' ? EMPTY : { question: faq.question, answer: faq.answer })
    setErrors({})
  }

  const submit = () => {
    const found: Partial<typeof EMPTY> = {}
    if (!values.question.trim()) found.question = 'Enter the question.'
    if (!values.answer.trim()) found.answer = 'Enter the answer.'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      { id: editing === 'new' ? undefined : editing?.id, values },
      {
        onSuccess: () => {
          toast.success(editing === 'new' ? 'Question added' : 'Question saved')
          setEditing(null)
        },
        onError: (e) => toast.error(getErrorMessage(e, 'Could not save. Please try again.')),
      },
    )
  }

  return (
    <>
      <CardSection
        id="faqs"
        title="Quick Questions"
        subtitle="Questions and answers shown on the Contact page. Visitors click a question to see its answer."
        icon={MessageCircleQuestion}
        count={faqs.length}
        onAdd={() => open('new')}
        emptyText="No questions yet. Add common ones, e.g. “What are the Mass times?”"
      >
        {faqs.map((faq, index) => (
          <CardRow
            key={faq.id}
            media={
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-gold">
                <CircleHelp className="size-5" />
              </span>
            }
            title={faq.question}
            text={faq.answer}
            isFirst={index === 0}
            isLast={index === faqs.length - 1}
            onEdit={() => open(faq)}
            onDelete={() => setDeleting(faq)}
            onMove={(d) => reorder.mutate(moveItem(faqs, index, index + d).map((f) => f.id), { onError: (e) => toast.error(getErrorMessage(e)) })}
          />
        ))}
      </CardSection>

      <CardModal open={editing !== null} title={editing === 'new' ? 'Add Question' : 'Edit Question'} saving={save.isPending} onClose={() => setEditing(null)} onSubmit={submit}>
        <div>
          <FormField label="Question *" value={values.question} onChange={(question) => setValues({ ...values, question })} maxLength={200} />
          <FieldError message={errors.question} />
        </div>
        <div>
          <TextAreaField label="Answer *" value={values.answer} onChange={(answer) => setValues({ ...values, answer })} rows={5} maxLength={3000} />
          <FieldError message={errors.answer} />
        </div>
      </CardModal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete question?"
        message={`“${deleting?.question ?? ''}” will be removed from the Contact page.`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Question deleted')
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  )
}
