import PageLoader from '../../components/admin/common/PageLoader'
import CallToAction from '../../components/public/CallToAction'
import PageHero from '../../components/public/PageHero'
import Highlights from '../../components/public/parishLife/Highlights'
import ParishActivities from '../../components/public/parishLife/ParishActivities'
import ParishGroups from '../../components/public/parishLife/ParishGroups'
import ParishIntro from '../../components/public/parishLife/ParishIntro'
import { useParishGroups, useParishLifeContent } from '../../hooks/public/parishLifeHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import { PARISH_LIFE_CTA } from '../../utils/parishLifeContent'

export default function ParishLife() {
  usePageTitle('Parish Life')
  const { data: content, isPending, isError, refetch } = useParishLifeContent()
  const { data: groups = [] } = useParishGroups()

  if (isPending) return <PageLoader />
  if (isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-ink">Sorry, this page could not be loaded.</p>
        <button type="button" onClick={() => refetch()} className="mt-4 text-sm font-semibold text-brand hover:underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <PageHero title={content.hero.title} subtitle={content.hero.subtitle} image={content.hero.image} crumb="Parish Life" />
      <Highlights highlights={content.highlights} />
      <ParishIntro intro={content.intro} />
      <ParishGroups groups={groups} />
      <ParishActivities activities={content.activities} />
      <CallToAction {...PARISH_LIFE_CTA} to={PUBLIC_PATHS.contact} image={content.hero.image} />
    </>
  )
}
