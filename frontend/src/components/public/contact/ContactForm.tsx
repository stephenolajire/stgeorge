import { isAxiosError } from 'axios'
import { CircleCheck, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useContactSubjects, useSendContactMessage } from '../../../hooks/public/contactHook'
import type { ContactFormValues } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import FormField from '../../admin/common/FormField'
import { SelectField } from '../../admin/common/Select'
import TextAreaField from '../../admin/common/TextAreaField'
import Eyebrow from '../Eyebrow'

const EMPTY: ContactFormValues = { name: '', email: '', phone: '', subject: '', message: '', website: '' }
type Errors = Partial<Record<keyof ContactFormValues, string>>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(v: ContactFormValues): Errors {
  const e: Errors = {}
  if (!v.name.trim()) e.name = 'Please enter your name.'
  if (!EMAIL.test(v.email.trim())) e.email = 'Please enter a valid email address.'
  if (!v.subject) e.subject = 'Please choose a subject.'
  if (!v.message.trim()) e.message = 'Please write your message.'
  return e
}

export default function ContactForm({ title, subtitle }: { title: string; subtitle: string }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const [failure, setFailure] = useState('')
  const { data: subjects = [] } = useContactSubjects()
  const send = useSendContactMessage()

  const set = (key: keyof ContactFormValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFailure('')
    if (Object.keys(found).length) return
    send.mutate(values, {
      onSuccess: () => {
        setValues(EMPTY)
        setSent(true)
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 429) {
          return setFailure('You have sent several messages recently. Please try again a little later, or call or email us.')
        }
        const data = isAxiosError(error) ? error.response?.data : null
        if (data && typeof data === 'object' && !('detail' in data)) {
          const fieldErrors: Errors = {}
          for (const [field, messages] of Object.entries(data)) {
            fieldErrors[field as keyof ContactFormValues] = Array.isArray(messages) ? String(messages[0]) : String(messages)
          }
          return setErrors(fieldErrors)
        }
        setFailure(getErrorMessage(error, 'Sorry, your message could not be sent. Please try again.'))
      },
    })
  }

  const err = (key: keyof ContactFormValues) => errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <Eyebrow line>Send Us a Message</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{subtitle}</p>}

      {sent ? (
        <div role="status" className="mt-6 flex flex-col items-center rounded-lg bg-success-soft px-6 py-10 text-center">
          <CircleCheck className="size-10 text-success" />
          <p className="mt-3 font-display text-lg font-bold text-primary">Thank you, your message has been sent.</p>
          <p className="mt-1 text-sm text-ink-soft">We will get back to you as soon as we can.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-brand hover:underline">
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <div>
            <FormField label="Full Name *" value={values.name} onChange={set('name')} placeholder="Enter your full name" autoComplete="name" maxLength={120} inputClassName="h-10 text-sm" />
            {err('name')}
          </div>
          <div>
            <FormField label="Email Address *" type="email" value={values.email} onChange={set('email')} placeholder="Enter your email address" autoComplete="email" inputClassName="h-10 text-sm" />
            {err('email')}
          </div>
          <div>
            <FormField label="Phone Number" type="tel" value={values.phone} onChange={set('phone')} placeholder="Enter your phone number" autoComplete="tel" maxLength={30} inputClassName="h-10 text-sm" />
            {err('phone')}
          </div>
          <div>
            <SelectField label="Subject *" value={values.subject} onChange={set('subject')} options={subjects} placeholder="Select a subject" />
            {err('subject')}
          </div>
          <div>
            <TextAreaField label="Message *" value={values.message} onChange={set('message')} placeholder="Write your message here..." rows={4} maxLength={5000} />
            {err('message')}
          </div>
          {/* Spam trap: hidden from people, often filled in by bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Website
              <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website')(e.target.value)} />
            </label>
          </div>
          {failure && (
            <p role="alert" className="rounded-md bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {failure}
            </p>
          )}
          <button
            type="submit"
            disabled={send.isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            <Send className="size-4" /> {send.isPending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
