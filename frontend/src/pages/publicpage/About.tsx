import HistorySection from '../../components/public/about/HistorySection'
import MissionValues from '../../components/public/about/MissionValues'
import ParishLeadership from '../../components/public/about/ParishLeadership'
import WhoWeAre from '../../components/public/about/WhoWeAre'
import CallToAction from '../../components/public/CallToAction'
import PageHero from '../../components/public/PageHero'
import { useAboutContent, useParishLeadership } from '../../hooks/public/aboutHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import PageLoader from '../../components/admin/common/PageLoader'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import { JOIN_CTA } from '../../utils/aboutContent'

export default function About() {
  usePageTitle('About')
  const { data: content, isPending, isError, refetch } = useAboutContent()
  const { data: leaders = [] } = useParishLeadership()

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
      <PageHero title={content.hero.title} subtitle={content.hero.subtitle} image={content.hero.image} crumb="About" />
      <div className="space-y-5 py-6">
        <WhoWeAre {...content.mainContent} />
        <MissionValues
          mission={content.mission}
          vision={content.vision}
          coreValues={content.coreValues}
          patron={content.patron}
        />
        <HistorySection {...content.history} fallbackImage={content.hero.image} />
      </div>
      <ParishLeadership leaders={leaders} diocese={content.parishInfo.diocese} />
      <CallToAction {...JOIN_CTA} buttonLabel="Get Involved" to={PUBLIC_PATHS.contact} image={content.hero.image} />
    </>
  )
}
