import PageLoader from '../../components/admin/common/PageLoader'
import CallToAction from '../../components/public/CallToAction'
import PageHero from '../../components/public/PageHero'
import Highlights from '../../components/public/parishLife/Highlights'
import SacramentsGrid from '../../components/public/sacraments/SacramentsGrid'
import SacramentsIntro from '../../components/public/sacraments/SacramentsIntro'
import { usePublishedSacraments, useSacramentsPageContent } from '../../hooks/public/sacramentsHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PUBLIC_PATHS } from '../../routes/publicRoute'

export default function Sacraments() {
  usePageTitle('Sacraments')
  const { data: content, isPending, isError, refetch } = useSacramentsPageContent()
  const { data: sacraments = [] } = usePublishedSacraments()

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
      <PageHero title={content.hero.title} subtitle={content.hero.subtitle} image={content.hero.image} crumb="Sacraments" />
      <SacramentsIntro intro={content.intro} quote={content.quote} />
      <SacramentsGrid sacraments={sacraments} title={content.list.title} subtitle={content.list.subtitle} />
      <Highlights highlights={content.features} />
      {(content.cta.title || content.cta.text) && (
        <CallToAction
          eyebrow="Journey With Us"
          title={content.cta.title}
          text={content.cta.text}
          buttonLabel="Contact the Parish"
          to={PUBLIC_PATHS.contact}
          image={content.hero.image}
        />
      )}
    </>
  )
}
