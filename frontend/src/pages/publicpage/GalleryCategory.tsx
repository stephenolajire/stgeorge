import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PageLoader from '../../components/admin/common/PageLoader'
import AlbumTile from '../../components/public/gallery/AlbumTile'
import CategoryChips from '../../components/public/gallery/CategoryChips'
import Lightbox from '../../components/public/gallery/Lightbox'
import PageHero from '../../components/public/PageHero'
import { useDayPhotos, useGalleryAlbums, useGalleryCategories, useGalleryPageContent } from '../../hooks/public/galleryHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import { GALLERY_CATEGORIES, albumDateLabel, categoryFromSlug } from '../../utils/gallery'

/** One category's photos, grouped by day. Opening a day plays it as a slideshow. */
export default function GalleryCategory() {
  const category = categoryFromSlug(useParams().category)
  const label = GALLERY_CATEGORIES.find((c) => c.value === category)?.label ?? 'Gallery'
  usePageTitle(`${label} | Gallery`)

  const page = useGalleryPageContent()
  const { data: categories = [] } = useGalleryCategories()
  const albums = useGalleryAlbums(category)
  const [openDate, setOpenDate] = useState<string | null>(null)
  const day = useDayPhotos(category, openDate)

  if (!category) return <Navigate to={PUBLIC_PATHS.gallery} replace />
  if (albums.isPending) return <PageLoader />

  const cover = categories.find((c) => c.value === category)?.cover
  const heroImage = cover ? { url: cover } : (page.data?.hero.image ?? null)

  return (
    <>
      <PageHero
        title={label}
        subtitle="Photos grouped by day. Open a day to watch it as a slideshow."
        image={heroImage}
        crumb={label}
        parent={{ label: 'Gallery', to: PUBLIC_PATHS.gallery }}
      />

      <section className="container-public space-y-6 py-8">
        <CategoryChips categories={categories} />
        {albums.isError ? (
          <p className="py-16 text-center text-ink">Sorry, these photos could not be loaded.</p>
        ) : albums.data.length === 0 ? (
          <p className="py-16 text-center text-muted">There are no photos in {label} yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.data.map((album) => (
              <li key={album.date}>
                <AlbumTile
                  title={albumDateLabel(album.date)}
                  count={album.count}
                  cover={album.cover}
                  as={(props) => (
                    <button type="button" onClick={() => setOpenDate(album.date)} aria-label={`Open ${albumDateLabel(album.date)} slideshow`} {...props} />
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {openDate && (
        <Lightbox
          key={openDate}
          title={`${label} · ${albumDateLabel(openDate)}`}
          photos={day.data}
          loading={day.isPending}
          onClose={() => setOpenDate(null)}
        />
      )}
    </>
  )
}
