import { Megaphone, Quote, ScrollText } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { sacramentsPageKey, useUpdateSacramentsPage } from '../../../hooks/admin/sacramentsHook'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import { sacramentsService } from '../../../services/admin/sacramentsService'
import type { SacramentsPageContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import HeroSectionEditor from '../about/HeroSectionEditor'
import FormField from '../common/FormField'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'
import HighlightsEditor from '../parishLife/HighlightsEditor'
import PageOutline from '../parishLife/PageOutline'

export const SACRAMENTS_PAGE_FORM_ID = 'sacraments-page-form'

interface SacramentsPageFormProps {
  content: SacramentsPageContent
  sacramentCount: number
}

/**
 * Everything on the public Sacraments page apart from the sacraments themselves, laid out like the About
 * page. Text is saved with "Save Changes" (in the page header); feature cards are saved as soon as they change.
 */
export default function SacramentsPageForm({ content, sacramentCount }: SacramentsPageFormProps) {
  const [hero, setHero] = useState(content.hero)
  const [intro, setIntro] = useState(content.intro)
  const [quote, setQuote] = useState(content.quote)
  const [list, setList] = useState(content.list)
  const [cta, setCta] = useState(content.cta)
  const { mutate: save } = useUpdateSacramentsPage()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(
      { hero, intro, quote, list, cta },
      {
        onSuccess: (saved) => {
          setHero((h) => ({ ...h, image: saved.hero.image }))
          toast.success('Sacraments page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="space-y-4">
        {/* The text sections form one form, submitted by "Save Changes" in the page header. */}
        <form id={SACRAMENTS_PAGE_FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-4">
          <div id="hero" className="scroll-mt-20">
            <HeroSectionEditor value={hero} onChange={setHero} />
          </div>

          <div id="about" className="scroll-mt-20">
            <SectionCard title="About the Sacraments" subtitle={'The "Encounters with Christ" block and the quote beside it.'} icon={Quote} serif>
              <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4">
                  <FormField label="Title" value={intro.title} onChange={(title) => setIntro({ ...intro, title })} maxLength={150} />
                  <TextAreaField label="Text" value={intro.text} onChange={(text) => setIntro({ ...intro, text })} rows={5} maxLength={3000} />
                </div>
                <div className="space-y-4">
                  <TextAreaField label="Quote" value={quote.text} onChange={(text) => setQuote({ ...quote, text })} rows={4} maxLength={400} />
                  <FormField label="Quote Source" value={quote.source} onChange={(source) => setQuote({ ...quote, source })} maxLength={150} />
                </div>
              </div>
            </SectionCard>
          </div>

          <div id="heading" className="scroll-mt-20">
            <SectionCard title="Sacraments Heading" subtitle="Shown above the sacrament cards." icon={ScrollText} serif>
              <div className="space-y-4">
                <FormField label="Title" value={list.title} onChange={(title) => setList({ ...list, title })} maxLength={150} />
                <FormField label="Subtitle" value={list.subtitle} onChange={(subtitle) => setList({ ...list, subtitle })} maxLength={300} />
              </div>
            </SectionCard>
          </div>
        </form>

        <HighlightsEditor
          id="features"
          title="Feature Cards"
          subtitle="The strip of small cards under the sacraments."
          noun="Feature"
          highlights={content.features}
          api={sacramentsService.features}
          queryKey={sacramentsPageKey}
        />

        <div id="cta" className="scroll-mt-20">
          <SectionCard title="Bottom Banner" subtitle={'The "Receive the Sacraments" banner with the Contact button.'} icon={Megaphone} serif>
            <div className="space-y-4">
              <FormField label="Title" value={cta.title} onChange={(title) => setCta({ ...cta, title })} maxLength={150} form={SACRAMENTS_PAGE_FORM_ID} />
              <FormField label="Text" value={cta.text} onChange={(text) => setCta({ ...cta, text })} maxLength={300} form={SACRAMENTS_PAGE_FORM_ID} />
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.sacraments}
          items={[
            { id: 'hero', label: 'Hero Section' },
            { id: 'about', label: 'About & Quote' },
            { id: 'heading', label: 'Sacraments Heading', note: `${sacramentCount} sacraments` },
            { id: 'features', label: 'Feature Cards', note: `${content.features.length} cards` },
            { id: 'cta', label: 'Bottom Banner' },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
          The sacraments themselves are on the “Sacraments” tab. Feature cards are saved as soon as you add or edit them;
          use “Save Changes” for everything else.
        </p>
      </div>
    </div>
  )
}
