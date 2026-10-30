import AboutHero from '../../components/public/about/AboutHero'
import HistorySection from '../../components/public/about/HistorySection'
import JoinCommunity from '../../components/public/about/JoinCommunity'
import MissionValues from '../../components/public/about/MissionValues'
import ParishLeadership from '../../components/public/about/ParishLeadership'
import WhoWeAre from '../../components/public/about/WhoWeAre'
import { useAboutContent, useParishLeadership } from '../../hooks/public/aboutHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import PageLoader from '../../components/admin/common/PageLoader'

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
      <AboutHero {...content.hero} />
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
      <JoinCommunity image={content.hero.image} />
    </>
  )
}
