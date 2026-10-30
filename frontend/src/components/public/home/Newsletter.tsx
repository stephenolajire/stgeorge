import { CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSubscribe } from '../../../hooks/public/homeHook'
import type { HomeNewsletter } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import Eyebrow from '../Eyebrow'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** "Stay Connected": navy banner with an email sign-up. */
export default function Newsletter({ newsletter }: { newsletter: HomeNewsletter }) {
  const [email, setEmail] = useState('')
  // Hidden from people; spam bots fill it in.
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const subscribe = useSubscribe()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    subscribe.mutate(
      { email: email.trim(), website },
      { onError: (err) => setError(getErrorMessage(err, 'Could not sign you up. Please try again.')) },
    )
  }

  return (
    <section className="relative overflow-hidden bg-primary">
      {newsletter.image && <img src={newsletter.image.url} alt="" className="absolute inset-0 size-full object-cover opacity-20" />}
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative mx-auto max-w-2xl px-5 py-14 text-center">
        <Eyebrow className="justify-center text-accent">Stay Connected</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-[2.5rem]">{newsletter.title}</h2>
        {newsletter.text && <p className="mt-3 text-white/90">{newsletter.text}</p>}
        {subscribe.isSuccess ? (
          <p role="status" className="mx-auto mt-7 flex max-w-md items-center justify-center gap-2.5 rounded-md bg-white/10 px-5 py-3.5 text-sm font-medium text-white">
            <CircleCheck className="size-5 text-accent" /> Thank you! You will now receive our parish updates.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="mx-auto mt-7 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
              <label className="flex-1">
                <span className="sr-only">Your email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                  className="h-12 w-full rounded-md bg-white px-5 text-sm text-ink outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-accent sm:rounded-r-none"
                />
              </label>
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] size-px opacity-0"
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="h-12 rounded-md bg-accent px-10 text-sm font-bold text-primary transition hover:bg-accent-hover disabled:opacity-70 sm:rounded-l-none"
              >
                {subscribe.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2.5 text-left text-sm text-accent-light">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
