import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { galleryService, type UploadOptions } from '../../services/admin/galleryService'
import type { GalleryCategory, Photo, PhotoForm, PhotoListParams } from '../../types/admin'

export const galleryKeys = {
  all: ['admin', 'gallery'] as const,
  list: (params: PhotoListParams) => ['admin', 'gallery', 'list', params] as const,
  summary: ['admin', 'gallery', 'summary'] as const,
}

export function usePhotos(params: PhotoListParams) {
  return useQuery({
    queryKey: galleryKeys.list(params),
    queryFn: () => galleryService.list(params),
    placeholderData: keepPreviousData,
  })
}

export const galleryPageKey = ['admin', 'gallery-page'] as const
export const updateGalleryPageMutationKey = ['admin', 'gallery-page', 'update'] as const

export function useGalleryPage() {
  return useQuery({ queryKey: galleryPageKey, queryFn: galleryService.getPage })
}

export function useUpdateGalleryPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateGalleryPageMutationKey,
    mutationFn: galleryService.updatePage,
    onSuccess: (saved) => {
      queryClient.setQueryData(galleryPageKey, saved)
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}

export function useGallerySummary() {
  return useQuery({ queryKey: galleryKeys.summary, queryFn: galleryService.summary })
}

/** Any change refreshes the lists, the tab counts and the public pages. */
function useGalleryMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}

export const useUpdatePhoto = () =>
  useGalleryMutation(({ photo, values }: { photo: Photo; values: PhotoForm }) => galleryService.update(photo, values))
export const useUploadPhotos = () => useGalleryMutation((options: UploadOptions) => galleryService.upload(options))
export const useDeletePhoto = () => useGalleryMutation(galleryService.remove)
export const useBulkDeletePhotos = () => useGalleryMutation(galleryService.bulkDelete)
export const useBulkMovePhotos = () =>
  useGalleryMutation(({ ids, category }: { ids: number[]; category: GalleryCategory }) => galleryService.bulkMove(ids, category))
