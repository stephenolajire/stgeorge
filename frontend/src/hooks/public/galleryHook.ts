import { useQuery } from '@tanstack/react-query'
import { publicGalleryService } from '../../services/public/galleryService'
import type { GalleryCategory } from '../../types/admin'

export const useGalleryPageContent = () =>
  useQuery({ queryKey: ['public', 'gallery-page'], queryFn: publicGalleryService.getPage })

export const useGalleryCategories = () =>
  useQuery({ queryKey: ['public', 'gallery-categories'], queryFn: publicGalleryService.categories })

export const useGalleryAlbums = (category: GalleryCategory | null) =>
  useQuery({
    queryKey: ['public', 'gallery-albums', category],
    queryFn: () => publicGalleryService.albums(category!),
    enabled: Boolean(category),
  })

/** Photos of one day (for the slideshow). Only loads once a day is opened. */
export const useDayPhotos = (category: GalleryCategory | null, date: string | null) =>
  useQuery({
    queryKey: ['public', 'gallery-day', category, date],
    queryFn: () => publicGalleryService.dayPhotos(category!, date!),
    enabled: Boolean(category && date),
  })
