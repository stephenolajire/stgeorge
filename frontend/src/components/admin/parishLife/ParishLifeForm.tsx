import { Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { parishLifePageKey, useUpdateParishLifePage } from '../../../hooks/admin/parishLifeHook'
import { parishLifeService } from '../../../services/admin/parishLifeService'
import type { ParishGroup, ParishLifeContent } from '../../../types/admin'
import HeroSectionEditor from '../about/HeroSectionEditor'
import { getErrorMessage } from '../../../utils/apiError'
import Button from '../common/Button'
import PageHeader from '../common/PageHeader'
import ActivitiesEditor from './ActivitiesEditor'
import GroupsEditor from './GroupsEditor'
import HighlightsEditor from './HighlightsEditor'
import IntroEditor from './IntroEditor'
import PageOutline from './PageOutline'

interface ParishLifeFormProps {
  /** Latest page data; the cards always come from here. */
  content: ParishLifeContent
  groups: ParishGroup[]
}

const cards = (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`

/**
 * The Parish Life page editor, laid out like the About page: one card per section of the public page.
 * Banner and introduction are saved with "Save Changes"; cards are saved as soon as they are added or edited.
 */
export default function ParishLifeForm({ content, groups }: ParishLifeFormProps) {
  const [hero, setHero] = useState(content.hero)
  const [intro, setIntro] = useState(content.intro)
  const { mutate: save, isPending: saving } = useUpdateParishLifePage()

  const handleSave = () =>
    save(
      { hero, intro },
      {
        onSuccess: (saved) => {
          // Swap local image previews for the stored images so they are not uploaded again.
          setHero((h) => ({ ...h, image: saved.hero.image }))
          setIntro((i) => ({ ...i, image: saved.intro.image }))
          toast.success('Parish Life page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parish Life"
        subtitle="Manage the content for your parish life page."
        breadcrumb={[{ label: 'Content' }, { label: 'Parish Life' }]}
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <div id="hero" className="scroll-mt-20">
            <HeroSectionEditor value={hero} onChange={setHero} />
          </div>
          <HighlightsEditor highlights={content.highlights} api={parishLifeService.highlights} queryKey={parishLifePageKey} />
          <IntroEditor value={intro} onChange={setIntro} />
          <GroupsEditor groups={groups} />
          <ActivitiesEditor activities={content.activities} />
        </div>
        <div className="xl:sticky xl:top-22 xl:self-start">
          <PageOutline
            items={[
              { id: 'hero', label: 'Hero Section' },
              { id: 'highlights', label: 'Highlights', note: cards(content.highlights.length) },
              { id: 'introduction', label: 'Introduction' },
              { id: 'groups', label: 'Parish Groups', note: cards(groups.length) },
              { id: 'activities', label: 'Activities', note: cards(content.activities.length) },
            ]}
          />
          <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
            Cards are saved as soon as you add or edit them. Use “Save Changes” for the banner and introduction.
          </p>
        </div>
      </div>
    </div>
  )
}
