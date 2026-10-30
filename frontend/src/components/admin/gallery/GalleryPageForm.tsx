import { Megaphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useUpdateGalleryPage } from '../../../hooks/admin/galleryHook'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { GalleryPageContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import HeroSectionEditor from '../about/HeroSectionEditor'
import FormField from '../common/FormField'
import SectionCard from '../common/SectionCard'
import PageOutline from '../parishLife/PageOutline'

export const GALLERY_PAGE_FORM_ID = 'gallery-page-form'

/** Hero and bottom banner of the public Gallery page. Saved with "Save Changes" in the page header. */
export default function GalleryPageForm({ content }: { content: GalleryPageContent }) {
  const [hero, setHero] = useState(content.hero)
  const [cta, setCta] = useState(content.cta)
  const { mutate: save } = useUpdateGalleryPage()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(
      { hero, cta },
      {
        onSuccess: (saved) => {
          setHero((h) => ({ ...h, image: saved.hero.image }))
          toast.success('Gallery page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <form id={GALLERY_PAGE_FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-4">
        <div id="hero" className="scroll-mt-20">
          <HeroSectionEditor value={hero} onChange={setHero} />
        </div>
        <div id="cta" className="scroll-mt-20">
          <SectionCard title="Bottom Banner" subtitle={'The "Many Moments, One Family" banner at the bottom of the page.'} icon={Megaphone} serif>
            <div className="space-y-4">
              <FormField label="Title" value={cta.title} onChange={(title) => setCta({ ...cta, title })} maxLength={150} />
              <FormField label="Text" value={cta.text} onChange={(text) => setCta({ ...cta, text })} maxLength={300} />
            </div>
          </SectionCard>
        </div>
      </form>
      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.gallery}
          items={[
            { id: 'hero', label: 'Hero Section' },
            { id: 'cta', label: 'Bottom Banner' },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
          The photo tiles on the public page come from the “Photos” tab: one tile per category, then one album per day.
        </p>
      </div>
    </div>
  )
}
