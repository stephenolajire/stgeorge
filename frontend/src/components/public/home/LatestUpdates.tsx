import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { HomeNewsHeading, NewsItem } from '../../../types/admin'
import { formatDay } from '../../../utils/newsEvents'
import Eyebrow from '../Eyebrow'

interface LatestUpdatesProps {
  heading: HomeNewsHeading
  posts: NewsItem[]
  onOpen: (post: NewsItem) => void
}

/** The three newest news posts. Opening one shows the whole post. */
export default function LatestUpdates({ heading, posts, onOpen }: LatestUpdatesProps) {
  if (!posts.length) return null
  return (
    <section className="bg-white">
      <div className="container-public py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>News &amp; Announcements</Eyebrow>
            <h2 className="mt-2 font-display text-4xl font-bold text-primary">{heading.title}</h2>
            {heading.subtitle && <p className="mt-2 text-ink-soft">{heading.subtitle}</p>}
          </div>
          <Link
            to={PUBLIC_PATHS.newsEvents}
            className="inline-flex h-11 items-center gap-2 rounded-md border-2 border-primary px-6 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            View All News <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="aspect-[2.6/1] overflow-hidden bg-mist">
                {post.image ? (
                  <img src={post.image} alt="" loading="lazy" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-primary/25">
                    <Newspaper className="size-10" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-primary">
                  <button type="button" onClick={() => onOpen(post)} className="text-left after:absolute after:inset-0 focus:outline-none">
                    {post.title}
                  </button>
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{post.shortDescription}</p>
                <p className="mt-auto flex items-center gap-2 pt-4 text-sm text-ink-soft">
                  <CalendarDays className="size-4" /> {formatDay(post.publishedOn)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
