import { useIsMutating } from '@tanstack/react-query'
import { Images, LayoutList, Plus, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import Pagination from '../../components/admin/common/Pagination'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import Select from '../../components/admin/common/Select'
import Tabs from '../../components/admin/common/Tabs'
import BulkBar from '../../components/admin/gallery/BulkBar'
import GalleryFilters, { type GalleryView } from '../../components/admin/gallery/GalleryFilters'
import PhotoCard from '../../components/admin/gallery/PhotoCard'
import PhotoDetailsPanel from '../../components/admin/gallery/PhotoDetailsPanel'
import PhotoList from '../../components/admin/gallery/PhotoList'
import UploadPhotosModal from '../../components/admin/gallery/UploadPhotosModal'
import GalleryPageForm, { GALLERY_PAGE_FORM_ID } from '../../components/admin/gallery/GalleryPageForm'
import {
  useBulkDeletePhotos,
  useBulkMovePhotos,
  useDeletePhoto,
  updateGalleryPageMutationKey,
  useGalleryPage,
  useGallerySummary,
  usePhotos,
} from '../../hooks/admin/galleryHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { GalleryCategory, GalleryDateFilter, GallerySort, Photo, PhotoListParams } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'
import { ALL_PHOTOS_ICON, GALLERY_CATEGORIES, PAGE_SIZES } from '../../utils/gallery'

type Deleting = { kind: 'one'; photo: Photo } | { kind: 'many'; ids: number[] }

export default function AdminGallery() {
  const [section, setSection] = useState<'photos' | 'page'>('photos')
  const pageContent = useGalleryPage()
  const savingPage = useIsMutating({ mutationKey: updateGalleryPageMutationKey }) > 0
  const [category, setCategory] = useState<GalleryCategory | ''>('')
  const [search, setSearch] = useState('')
  const [date, setDate] = useState<GalleryDateFilter>('')
  const [sort, setSort] = useState<GallerySort>('newest')
  const [view, setView] = useState<GalleryView>('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [checked, setChecked] = useState<Set<number>>(new Set())
  // The photo shown in the details panel. null = first photo on the page; 'none' = panel closed.
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null | 'none'>(null)
  const [panelVersion, setPanelVersion] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebouncedValue(search.trim())
  const params: PhotoListParams = {
    category: category || undefined,
    search: debouncedSearch,
    date,
    ordering: sort,
    page,
    pageSize,
  }
  const list = usePhotos(params)
  const summary = useGallerySummary()
  const deleteOne = useDeletePhoto()
  const bulkDelete = useBulkDeletePhotos()
  const bulkMove = useBulkMovePhotos()

  const photos = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const offset = (page - 1) * pageSize
  const counts = summary.data?.counts

  // Until a photo is clicked, the panel shows the first photo on the page. A clicked photo stays in the panel
  // even if a filter or sort moves it off this page; the latest copy from the list is used when it is here.
  const selected =
    selectedPhoto === 'none'
      ? null
      : selectedPhoto === null
        ? (photos[0] ?? null)
        : (photos.find((p) => p.id === selectedPhoto.id) ?? selectedPhoto)

  /** Changing what is listed goes back to page 1 and clears the ticks. */
  const resetting = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
    setChecked(new Set())
  }

  const select = (photo: Photo) => {
    setSelectedPhoto(photo)
    setPanelVersion((v) => v + 1)
    if (window.innerWidth < 1280) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const check = (photo: Photo, on: boolean) =>
    setChecked((current) => {
      const next = new Set(current)
      if (on) next.add(photo.id)
      else next.delete(photo.id)
      return next
    })

  const allOnPageChecked = photos.length > 0 && photos.every((p) => checked.has(p.id))
  const toggleAllOnPage = () =>
    setChecked((current) => {
      const next = new Set(current)
      photos.forEach((p) => (allOnPageChecked ? next.delete(p.id) : next.add(p.id)))
      return next
    })

  const confirmDelete = () => {
    if (!deleting) return
    const done = (message: string, ids: number[]) => {
      toast.success(message)
      setChecked((current) => new Set([...current].filter((id) => !ids.includes(id))))
      if (selected && ids.includes(selected.id)) setSelectedPhoto(null)
      if (photos.length === ids.length && page > 1) setPage((p) => p - 1)
      setDeleting(null)
    }
    const onError = (error: unknown) => toast.error(getErrorMessage(error, 'Could not delete. Please try again.'))
    if (deleting.kind === 'one') {
      deleteOne.mutate(deleting.photo.id, { onSuccess: () => done('Photo deleted', [deleting.photo.id]), onError })
    } else {
      bulkDelete.mutate(deleting.ids, {
        onSuccess: ({ deleted }) => done(`${deleted} ${deleted === 1 ? 'photo' : 'photos'} deleted`, deleting.ids),
        onError,
      })
    }
  }

  const moveChecked = (target: GalleryCategory) =>
    bulkMove.mutate(
      { ids: [...checked], category: target },
      {
        onSuccess: ({ moved }) => {
          const label = GALLERY_CATEGORIES.find((c) => c.value === target)?.label
          toast.success(`${moved} ${moved === 1 ? 'photo' : 'photos'} moved to ${label}`)
          setChecked(new Set())
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gallery"
        subtitle="Manage photos for your website gallery. Upload, organize and categorize images."
        breadcrumb={[{ label: 'Content' }, { label: 'Gallery' }]}
        actions={
          section === 'photos' ? (
            <Button variant="brand" onClick={() => setUploading(true)} className="h-10.5 px-5">
              <Plus className="size-4.5" /> Upload Photos
            </Button>
          ) : (
            <Button type="submit" form={GALLERY_PAGE_FORM_ID} disabled={savingPage || !pageContent.data}>
              <Save className="size-4" /> {savingPage ? 'Saving...' : 'Save Changes'}
            </Button>
          )
        }
      />

      <Tabs
        label="Gallery sections"
        value={section}
        onChange={setSection}
        items={[
          { value: 'photos', label: `Photos (${counts?.all ?? 0})`, icon: Images },
          { value: 'page', label: 'Page Content', icon: LayoutList },
        ]}
      />

      {section === 'page' ? (
        pageContent.isPending ? (
          <LoadingCard label="Loading page content..." />
        ) : pageContent.isError ? (
          <ErrorCard message={getErrorMessage(pageContent.error, 'Could not load the page content.')} onRetry={() => pageContent.refetch()} />
        ) : (
          <GalleryPageForm content={pageContent.data} />
        )
      ) : (
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18.5rem]">
        <section className="card min-w-0 space-y-4 p-3.5">
          <Tabs
            compact
            label="Photo categories"
            value={category || 'all'}
            onChange={(v) => resetting(setCategory)(v === 'all' ? '' : (v as GalleryCategory))}
            items={[
              { value: 'all', label: `All Photos (${counts?.all ?? 0})`, icon: ALL_PHOTOS_ICON },
              ...GALLERY_CATEGORIES.map((c) => ({ value: c.value, label: `${c.label} (${counts?.[c.value] ?? 0})`, icon: c.icon })),
            ]}
          />

          <GalleryFilters
            search={search}
            onSearchChange={resetting(setSearch)}
            category={category}
            onCategoryChange={resetting(setCategory)}
            date={date}
            onDateChange={resetting(setDate)}
            sort={sort}
            onSortChange={resetting(setSort)}
            view={view}
            onViewChange={setView}
          />

          {checked.size > 0 && (
            <BulkBar
              count={checked.size}
              allOnPageChecked={allOnPageChecked}
              onToggleAllOnPage={toggleAllOnPage}
              onMove={moveChecked}
              onDelete={() => setDeleting({ kind: 'many', ids: [...checked] })}
              onClear={() => setChecked(new Set())}
              busy={bulkMove.isPending || bulkDelete.isPending}
            />
          )}

          {list.isPending ? (
            <LoadingCard label="Loading photos..." />
          ) : list.isError ? (
            <ErrorCard message={getErrorMessage(list.error, 'Could not load photos.')} onRetry={() => list.refetch()} />
          ) : count === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              {debouncedSearch || date || category ? 'No photos match these filters.' : 'No photos yet. Upload the first ones with “Upload Photos”.'}
            </p>
          ) : view === 'grid' ? (
            <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <PhotoCard
                    photo={photo}
                    selected={photo.id === selected?.id}
                    checked={checked.has(photo.id)}
                    onSelect={() => select(photo)}
                    onCheck={(on) => check(photo, on)}
                    onDelete={() => setDeleting({ kind: 'one', photo })}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <PhotoList
              photos={photos}
              selectedId={selected?.id ?? null}
              checked={checked}
              onSelect={select}
              onCheck={check}
              onDelete={(photo) => setDeleting({ kind: 'one', photo })}
            />
          )}

          {count > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-ink-soft">
                Showing {offset + 1} to {offset + photos.length} of {count} photos
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Pagination page={page} pageCount={Math.ceil(count / pageSize)} onChange={setPage} />
                <Select
                  aria-label="Photos per page"
                  value={String(pageSize)}
                  onChange={(v) => resetting(setPageSize)(Number(v))}
                  options={PAGE_SIZES.map((n) => ({ value: String(n), label: `${n} per page` }))}
                  className="w-33"
                />
              </div>
            </div>
          )}
        </section>

        <div ref={panelRef} className="scroll-mt-20 xl:sticky xl:top-22">
          <PhotoDetailsPanel
            key={`${selected?.id ?? 'none'}-${panelVersion}`}
            photo={selected}
            onClose={() => setSelectedPhoto('none')}
            onDelete={(photo) => setDeleting({ kind: 'one', photo })}
            onSaved={setSelectedPhoto}
          />
        </div>
      </div>
      )}

      {uploading && <UploadPhotosModal open defaultCategory={category || 'others'} onClose={() => setUploading(false)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.kind === 'many' ? `Delete ${deleting.ids.length} photos?` : 'Delete photo?'}
        message={
          deleting?.kind === 'many'
            ? 'The selected photos will be removed from the gallery permanently.'
            : `“${deleting?.kind === 'one' ? deleting.photo.title : ''}” will be removed from the gallery permanently.`
        }
        confirmLabel="Delete"
        busy={deleteOne.isPending || bulkDelete.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
