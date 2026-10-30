import { Link } from 'react-router-dom'
import PageLoader from '../../components/admin/common/PageLoader'
import CallToAction from '../../components/public/CallToAction'
import AlbumTile from '../../components/public/gallery/AlbumTile'
import CategoryChips from '../../components/public/gallery/CategoryChips'
import PageHero from '../../components/public/PageHero'
import { useGalleryCategories, useGalleryPageContent } from '../../hooks/public/galleryHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import { GALLERY_CTA } from '../../utils/galleryContent'
import { categorySlug } from '../../utils/gallery'

export default function Gallery() {
  usePageTitle('Gallery')
  const page = useGalleryPageContent()
  const { data: categories = [], isPending: loadingCategories } = useGalleryCategories()

  if (page.isPending) return <PageLoader />
  if (page.isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-ink">Sorry, this page could not be loaded.</p>
        <button type="button" onClick={() => page.refetch()} className="mt-4 text-sm font-semibold text-brand hover:underline">
          Try again
        </button>
      </div>
    )
  }
  const { hero, cta } = page.data

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} crumb="Gallery" />

      <section className="container-public space-y-6 py-8">
        <CategoryChips categories={categories} />
        {!loadingCategories && categories.length === 0 ? (
          <p className="py-16 text-center text-muted">Photos will appear here soon.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c) => (
              <li key={c.value}>
                <AlbumTile
                  title={c.label}
                  count={c.count}
                  cover={c.cover}
                  as={(props) => <Link to={`${PUBLIC_PATHS.gallery}/${categorySlug(c.value)}`} {...props} />}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {(cta.title || cta.text) && (
        <CallToAction
          eyebrow={GALLERY_CTA.eyebrow}
          title={cta.title}
          text={cta.text}
          buttonLabel={GALLERY_CTA.buttonLabel}
          to={PUBLIC_PATHS.newsEvents}
          image={hero.image}
        />
      )}
    </>
  )
}
