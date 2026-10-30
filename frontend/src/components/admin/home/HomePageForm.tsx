import { CalendarDays, Info, Mail, Newspaper, Sun, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { homePageKey, useUpdateHomePage } from '../../../hooks/admin/homeHook'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import { homeService } from '../../../services/admin/homeService'
import type { HomeContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import FormField from '../common/FormField'
import ImageUpload from '../common/ImageUpload'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'
import HighlightsEditor from '../parishLife/HighlightsEditor'
import PageOutline from '../parishLife/PageOutline'
import QuickLinksEditor from './QuickLinksEditor'

export const HOME_PAGE_FORM_ID = 'home-page-form'
const cards = (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`

/**
 * The Home page editor: one card per section of the public page, in the same order.
 * Text and images are saved with "Save Changes" (the button in the page header); cards save on their own.
 */
export default function HomePageForm({ content }: { content: HomeContent }) {
  const [hero, setHero] = useState(content.hero)
  const [about, setAbout] = useState(content.about)
  const [news, setNews] = useState(content.news)
  const [newsletter, setNewsletter] = useState(content.newsletter)
  const { mutate: save } = useUpdateHomePage()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!hero.title.trim()) {
      toast.error('Enter the banner title.')
      return
    }
    save(
      { hero, about, news, newsletter },
      {
        onSuccess: (saved) => {
          // Swap local image previews for the stored images so they are not uploaded again.
          setHero((h) => ({ ...h, image: saved.hero.image }))
          setAbout((a) => ({ ...a, image: saved.about.image }))
          setNewsletter((n) => ({ ...n, image: saved.newsletter.image }))
          toast.success('Home page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="space-y-4">
        {/* Sections saved with "Save Changes" are inside this form; the card sections (which have their own popups) are not. */}
        <form id={HOME_PAGE_FORM_ID} onSubmit={submit} noValidate>
          <div id="hero" className="scroll-mt-20">
            <SectionCard title="Welcome Banner" subtitle="The large banner at the top of the Home page." icon={Sun} iconClassName="text-warning" serif>
              <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4">
                  <div>
                    <FormField label="Title *" value={hero.title} onChange={(title) => setHero({ ...hero, title })} maxLength={150} />
                    <p className="mt-1 text-xs text-muted">Text after the last comma is shown smaller, on its own line (e.g. “Ofatedo”).</p>
                  </div>
                  <FormField label="Tagline" value={hero.tagline} onChange={(tagline) => setHero({ ...hero, tagline })} maxLength={150} />
                  <FormField label="Text" value={hero.text} onChange={(text) => setHero({ ...hero, text })} maxLength={300} />
                  <FormField label="Quote" value={hero.quote} onChange={(quote) => setHero({ ...hero, quote })} maxLength={200} placeholder="Leave empty to hide the quote card" />
                </div>
                <div>
                  <p className="form-label">Banner Image</p>
                  <ImageUpload value={hero.image} onChange={(image) => setHero({ ...hero, image })} alt="Banner image" controls="hover" className="h-56" />
                  <p className="mt-1 text-xs text-muted">A wide photo of the church works best. JPG, PNG up to 5MB.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </form>

        <HighlightsEditor
          highlights={content.highlights}
          api={homeService.highlights}
          queryKey={homePageKey}
          subtitle="The row of small cards under the banner (Worship, Community, ...)."
        />

        <div id="event" className="scroll-mt-20">
          <SectionCard title="Upcoming Event" icon={CalendarDays} serif>
            <p className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                This section shows an event from{' '}
                <Link to={ADMIN_PATHS.newsEvents} className="font-medium text-brand hover:underline">
                  News &amp; Events
                </Link>
                : the soonest upcoming event marked <strong className="font-semibold text-ink">Featured</strong>, otherwise the next upcoming event.
                Its photo appears on the right. When nothing is coming up, the section is hidden.
              </span>
            </p>
          </SectionCard>
        </div>

        <QuickLinksEditor links={content.links} />

        <form onSubmit={submit} noValidate className="space-y-4">
          <div id="about" className="scroll-mt-20">
            <SectionCard title="About Our Parish" subtitle="The photo and text with the “Learn More About Us” button." icon={UsersRound} serif>
              <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4">
                  <FormField label="Title" value={about.title} onChange={(title) => setAbout({ ...about, title })} maxLength={150} />
                  <div>
                    <TextAreaField label="Text" value={about.text} onChange={(text) => setAbout({ ...about, text })} rows={5} maxLength={3000} />
                    <p className="mt-1.5 text-xs text-muted">Leave a blank line between paragraphs.</p>
                  </div>
                </div>
                <div>
                  <p className="form-label">Image</p>
                  <ImageUpload value={about.image} onChange={(image) => setAbout({ ...about, image })} alt="About image" controls="hover" className="h-52" />
                </div>
              </div>
            </SectionCard>
          </div>

          <div id="news" className="scroll-mt-20">
            <SectionCard title="Latest Updates" subtitle="Heading above the three newest posts from News & Events." icon={Newspaper} serif>
              <div className="grid gap-4 lg:grid-cols-2">
                <FormField label="Title" value={news.title} onChange={(title) => setNews({ ...news, title })} maxLength={150} />
                <FormField label="Subtitle" value={news.subtitle} onChange={(subtitle) => setNews({ ...news, subtitle })} maxLength={300} />
              </div>
            </SectionCard>
          </div>

          <div id="newsletter" className="scroll-mt-20">
            <SectionCard title="Stay Connected" subtitle="The newsletter banner. Sign-ups appear in the Subscribers tab." icon={Mail} serif>
              <div className="grid gap-4.5 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4">
                  <FormField label="Title" value={newsletter.title} onChange={(title) => setNewsletter({ ...newsletter, title })} maxLength={150} />
                  <FormField label="Text" value={newsletter.text} onChange={(text) => setNewsletter({ ...newsletter, text })} maxLength={300} />
                </div>
                <div>
                  <p className="form-label">Background Image</p>
                  <ImageUpload value={newsletter.image} onChange={(image) => setNewsletter({ ...newsletter, image })} alt="Banner background" controls="hover" className="h-32" />
                  <p className="mt-1 text-xs text-muted">Shown faintly behind the navy banner.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </form>
      </div>

      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.home}
          items={[
            { id: 'hero', label: 'Welcome Banner' },
            { id: 'highlights', label: 'Highlights', note: cards(content.highlights.length) },
            { id: 'event', label: 'Upcoming Event' },
            { id: 'links', label: 'Quick Links', note: cards(content.links.length) },
            { id: 'about', label: 'About Our Parish' },
            { id: 'news', label: 'Latest Updates' },
            { id: 'newsletter', label: 'Stay Connected' },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
          Cards are saved as soon as you add or edit them. Use “Save Changes” for the text and images.
        </p>
      </div>
    </div>
  )
}
