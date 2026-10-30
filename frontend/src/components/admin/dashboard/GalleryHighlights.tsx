import { Images } from 'lucide-react'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { GalleryPhoto } from '../../../types/admin'
import ImageTile from '../common/ImageTile'
import SectionCard from '../common/SectionCard'

export default function GalleryHighlights({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <SectionCard title="Gallery Highlights" icon={Images} viewAllPath={ADMIN_PATHS.gallery}>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <ImageTile key={photo.id} src={photo.imageUrl} alt={photo.title} className="aspect-3/2 w-full" />
        ))}
      </div>
    </SectionCard>
  )
}
