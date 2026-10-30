import { galleryService } from '../admin/galleryService'

// Read-only calls for the public Gallery pages.
export const publicGalleryService = {
  getPage: galleryService.getPage,
  categories: galleryService.categories,
  albums: galleryService.albums,
  dayPhotos: galleryService.dayPhotos,
}
