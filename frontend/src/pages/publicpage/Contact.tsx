import PageLoader from '../../components/admin/common/PageLoader'
import ContactForm from '../../components/public/contact/ContactForm'
import FaqAccordion from '../../components/public/contact/FaqAccordion'
import InfoCards from '../../components/public/contact/InfoCards'
import ListenBanner from '../../components/public/contact/ListenBanner'
import LocationCard from '../../components/public/contact/LocationCard'
import PageHero from '../../components/public/PageHero'
import { useContactContent } from '../../hooks/public/contactHook'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function Contact() {
  usePageTitle('Contact Us')
  const { data: content, isPending, isError, refetch } = useContactContent()

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

  const hasFaqs = content.faqs.length > 0
  const hasBanner = Boolean(content.banner.title || content.banner.quote)

  return (
    <>
      <PageHero title={content.hero.title} subtitle={content.hero.subtitle} image={content.hero.image} crumb="Contact" />
      <InfoCards details={content.details} />

      <section className="container-public-wide grid items-start gap-5 pb-6 lg:grid-cols-2">
        <ContactForm title={content.form.title} subtitle={content.form.subtitle} />
        <LocationCard map={content.map} />
      </section>

      {(hasFaqs || hasBanner) && (
        <section className={`container-public-wide grid items-stretch gap-5 pb-10 ${hasFaqs && hasBanner ? 'lg:grid-cols-[1fr_1.4fr]' : ''}`}>
          {hasFaqs && <FaqAccordion title={content.faq.title} subtitle={content.faq.subtitle} faqs={content.faqs} />}
          {hasBanner && <ListenBanner banner={content.banner} />}
        </section>
      )}
    </>
  )
}
