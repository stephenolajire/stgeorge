import { Megaphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useUpdateNewsEventsPage } from '../../../hooks/admin/newsEventsHook'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { NewsEventsPageContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import HeroSectionEditor from '../about/HeroSectionEditor'
import FormField from '../common/FormField'
import SectionCard from '../common/SectionCard'
import PageOutline from '../parishLife/PageOutline'

export const NEWS_EVENTS_PAGE_FORM_ID = 'news-events-page-form'

export default function NewsEventsPageForm({ content }: { content: NewsEventsPageContent }) {
  const [hero, setHero] = useState(content.hero)
  const [cta, setCta] = useState(content.cta)
  const { mutate: save } = useUpdateNewsEventsPage()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    save(
      { hero, cta },
      {
        onSuccess: (saved) => {
          setHero((h) => ({ ...h, image: saved.hero.image }))
          toast.success('News & Events page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <form id={NEWS_EVENTS_PAGE_FORM_ID} onSubmit={submit} noValidate className="space-y-4">
        <div id="hero" className="scroll-mt-20">
          <HeroSectionEditor value={hero} onChange={setHero} />
        </div>
        <div id="cta" className="scroll-mt-20">
          <SectionCard title="Bottom Banner" subtitle={'The "Join Our Parish Community" banner at the bottom of the page.'} icon={Megaphone} serif>
            <div className="space-y-4">
              <FormField label="Title" value={cta.title} onChange={(title) => setCta({ ...cta, title })} maxLength={150} />
              <FormField label="Text" value={cta.text} onChange={(text) => setCta({ ...cta, text })} maxLength={300} />
            </div>
          </SectionCard>
        </div>
      </form>
      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.newsEvents}
          items={[
            { id: 'hero', label: 'Hero Section' },
            { id: 'cta', label: 'Bottom Banner' },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">Events and news cards come from the Events and News tabs. Only published items appear on the website.</p>
      </div>
    </div>
  )
}
