import { ContactRound, Map, Quote } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useUpdateContactPage } from '../../../hooks/admin/contactHook'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { ContactPageContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import HeroSectionEditor from '../about/HeroSectionEditor'
import FormField from '../common/FormField'
import ImagePickerField from '../common/ImagePickerField'
import SectionCard from '../common/SectionCard'
import TextAreaField from '../common/TextAreaField'
import PageOutline from '../parishLife/PageOutline'
import FaqEditor from './FaqEditor'

export const CONTACT_PAGE_FORM_ID = 'contact-page-form'

/** Everything on the public Contact page. Text is saved with "Save Changes"; questions are saved straight away. */
export default function ContactPageForm({ content }: { content: ContactPageContent }) {
  const [hero, setHero] = useState(content.hero)
  const [details, setDetails] = useState(content.details)
  const [formText, setFormText] = useState(content.form)
  const [map, setMap] = useState(content.map)
  const [faq, setFaq] = useState(content.faq)
  const [banner, setBanner] = useState(content.banner)
  const { mutate: save } = useUpdateContactPage()

  const d = <K extends keyof typeof details>(key: K) => (value: string) => setDetails({ ...details, [key]: value })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(
      { hero, details, form: formText, map, faq, banner },
      {
        onSuccess: (saved) => {
          setHero((h) => ({ ...h, image: saved.hero.image }))
          setBanner((b) => ({ ...b, image: saved.banner.image }))
          toast.success('Contact page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="space-y-4">
        <form id={CONTACT_PAGE_FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-4">
          <div id="hero" className="scroll-mt-20">
            <HeroSectionEditor value={hero} onChange={setHero} />
          </div>

          <div id="details" className="scroll-mt-20">
            <SectionCard title="Contact Details" subtitle="The four cards at the top. Also used in the website footer and in emails." icon={ContactRound} serif>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextAreaField label="Address" value={details.address} onChange={d('address')} rows={2} maxLength={250} className="sm:col-span-2" />
                <FormField label="Phone" value={details.phone} onChange={d('phone')} maxLength={40} placeholder="+234 …" />
                <FormField label="Phone Hours" value={details.phoneHours} onChange={d('phoneHours')} maxLength={100} />
                <FormField label="Email" type="email" value={details.email} onChange={d('email')} />
                <FormField label="Email Note" value={details.emailNote} onChange={d('emailNote')} maxLength={150} />
                <FormField label="Office Days" value={details.officeDays} onChange={d('officeDays')} maxLength={100} />
                <FormField label="Office Hours" value={details.officeHours} onChange={d('officeHours')} maxLength={100} />
              </div>
            </SectionCard>
          </div>

          <div id="form-map" className="scroll-mt-20">
            <SectionCard title="Form & Map" subtitle={'The "Get in Touch" form and the "Our Location" map.'} icon={Map} serif>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <FormField label="Form Title" value={formText.title} onChange={(title) => setFormText({ ...formText, title })} maxLength={150} />
                  <TextAreaField label="Form Subtitle" value={formText.subtitle} onChange={(subtitle) => setFormText({ ...formText, subtitle })} rows={2} maxLength={300} />
                  <FormField label="Questions Title" value={faq.title} onChange={(title) => setFaq({ ...faq, title })} maxLength={150} />
                  <TextAreaField label="Questions Subtitle" value={faq.subtitle} onChange={(subtitle) => setFaq({ ...faq, subtitle })} rows={2} maxLength={300} />
                </div>
                <div className="space-y-4">
                  <FormField label="Map Title" value={map.title} onChange={(title) => setMap({ ...map, title })} maxLength={150} />
                  <TextAreaField label="Map Subtitle" value={map.subtitle} onChange={(subtitle) => setMap({ ...map, subtitle })} rows={2} maxLength={300} />
                  <div>
                    <FormField label="Map Search" value={map.query} onChange={(query) => setMap({ ...map, query })} maxLength={250} />
                    <p className="mt-1 text-xs text-muted">What the map looks up, e.g. the church name and town.</p>
                  </div>
                  <TextAreaField label="Directions" value={map.directions} onChange={(directions) => setMap({ ...map, directions })} rows={3} maxLength={1000} />
                </div>
              </div>
            </SectionCard>
          </div>

          <div id="banner" className="scroll-mt-20">
            <SectionCard title="Side Banner" subtitle={'The "A Church Family Always Ready to Listen" banner beside the questions.'} icon={Quote} serif>
              <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
                <div className="space-y-4">
                  <FormField label="Title" value={banner.title} onChange={(title) => setBanner({ ...banner, title })} maxLength={150} />
                  <TextAreaField label="Quote" value={banner.quote} onChange={(quote) => setBanner({ ...banner, quote })} rows={3} maxLength={300} />
                  <FormField label="Quote Source" value={banner.quoteSource} onChange={(quoteSource) => setBanner({ ...banner, quoteSource })} maxLength={100} />
                </div>
                <ImagePickerField label="Background Image" value={banner.image} onChange={(image) => setBanner({ ...banner, image })} className="h-44" />
              </div>
            </SectionCard>
          </div>
        </form>

        <FaqEditor faqs={content.faqs} />
      </div>

      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.contact}
          items={[
            { id: 'hero', label: 'Hero Section' },
            { id: 'details', label: 'Contact Details' },
            { id: 'form-map', label: 'Form & Map' },
            { id: 'banner', label: 'Side Banner' },
            { id: 'faqs', label: 'Quick Questions', note: `${content.faqs.length} cards` },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">Questions are saved as soon as you add or edit them; use “Save Changes” for everything else.</p>
      </div>
    </div>
  )
}
