import { Calendar, Compass, HandHeart, Heart, Save, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useUpdateAboutPage } from '../../../hooks/admin/aboutHook'
import { aboutStatsMock } from '../../../services/mock/adminAbout'
import type { AboutPageContent, KeyStatistic } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import Button from '../common/Button'
import PageHeader from '../common/PageHeader'
import HeroSectionEditor from './HeroSectionEditor'
import HistoryEditor from './HistoryEditor'
import KeyStatistics from './KeyStatistics'
import MainContentEditor from './MainContentEditor'
import MissionVisionEditor from './MissionVisionEditor'
import ParishInfoCard from './ParishInfoCard'
import ValuesPatronEditor from './ValuesPatronEditor'

/** The About page editor. Mounted once the saved content has loaded. */
export default function AboutPageForm({ initialContent }: { initialContent: AboutPageContent }) {
  const [content, setContent] = useState<AboutPageContent>(initialContent)
  const { mutate: save, isPending: saving } = useUpdateAboutPage()

  const update = <K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) =>
    setContent((prev) => ({ ...prev, [key]: value }))

  // The first two statistics follow the Parish Information fields as you type.
  const stats = useMemo<KeyStatistic[]>(
    () => [
      { label: 'Located in', value: content.parishInfo.diocese, icon: Compass, tone: 'info' },
      { label: 'Year Established', value: content.parishInfo.established, icon: Calendar, tone: 'info' },
      { label: 'Active Parish Groups', value: aboutStatsMock.activeParishGroups, icon: Users, tone: 'success', filled: true },
      { label: 'Weekly Masses', value: aboutStatsMock.weeklyMasses, icon: HandHeart, tone: 'violet', filled: true },
      { label: 'Growing Community', value: 'Faithful and United', icon: Heart, tone: 'danger', filled: true },
    ],
    [content.parishInfo.diocese, content.parishInfo.established],
  )

  const handleSave = () =>
    save(content, {
      onSuccess: (saved) => {
        // Swap local image previews for the stored images so they are not uploaded again.
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, image: saved.hero.image },
          mainContent: { ...prev.mainContent, image: saved.mainContent.image },
          history: { ...prev.history, image: saved.history.image },
        }))
        toast.success('About page saved')
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not save the About page. Please try again.')),
    })

  return (
    <div className="space-y-5">
      <PageHeader
        title="About Page"
        subtitle="Manage the content for your parish's About page."
        breadcrumb={[{ label: 'Content' }, { label: 'About' }]}
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <HeroSectionEditor value={content.hero} onChange={(hero) => update('hero', hero)} />
          <MainContentEditor value={content.mainContent} onChange={(main) => update('mainContent', main)} />
          <MissionVisionEditor
            mission={content.mission}
            vision={content.vision}
            onMissionChange={(mission) => update('mission', mission)}
            onVisionChange={(vision) => update('vision', vision)}
          />
          <ValuesPatronEditor
            coreValues={content.coreValues}
            patron={content.patron}
            onCoreValuesChange={(coreValues) => update('coreValues', coreValues)}
            onPatronChange={(patron) => update('patron', patron)}
          />
          <HistoryEditor value={content.history} onChange={(history) => update('history', history)} />
        </div>
        <div className="space-y-4">
          <ParishInfoCard value={content.parishInfo} onChange={(info) => update('parishInfo', info)} />
          <KeyStatistics stats={stats} />
        </div>
      </div>
    </div>
  )
}
