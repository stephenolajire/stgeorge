import { CloudUpload, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { toast } from 'react-toastify'
import { useUploadPhotos } from '../../../hooks/admin/galleryHook'
import type { GalleryCategory } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { GALLERY_CATEGORIES, MAX_FILES_PER_UPLOAD, PHOTO_MAX_MB, PHOTO_TYPES, todayIso } from '../../../utils/gallery'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { SelectField } from '../common/Select'

interface Picked {
  file: File
  preview: string
}

interface UploadPhotosModalProps {
  open: boolean
  /** Pre-selected category (the open tab). Read when the popup mounts: mount it only while open. */
  defaultCategory: GalleryCategory
  onClose: () => void
}

/** Upload several photos at once. Each becomes a photo titled after its file name; edit details afterwards. */
export default function UploadPhotosModal({ open, defaultCategory, onClose }: UploadPhotosModalProps) {
  const [picked, setPicked] = useState<Picked[]>([])
  const [category, setCategory] = useState<GalleryCategory>(defaultCategory)
  const [dateTaken, setDateTaken] = useState(todayIso)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPhotos()

  const clear = () => {
    picked.forEach((p) => URL.revokeObjectURL(p.preview))
    setPicked([])
    setProgress(0)
  }

  const close = () => {
    if (upload.isPending) return
    clear()
    onClose()
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const accepted: Picked[] = []
    const rejected: string[] = []
    for (const file of Array.from(list)) {
      if (!PHOTO_TYPES.includes(file.type)) rejected.push(`${file.name} (not JPG, PNG or WebP)`)
      else if (file.size > PHOTO_MAX_MB * 1024 * 1024) rejected.push(`${file.name} (over ${PHOTO_MAX_MB} MB)`)
      else accepted.push({ file, preview: URL.createObjectURL(file) })
    }
    if (rejected.length) toast.error(`Skipped: ${rejected.join(', ')}`)
    setPicked((current) => {
      const next = [...current, ...accepted]
      if (next.length > MAX_FILES_PER_UPLOAD) {
        toast.error(`You can upload up to ${MAX_FILES_PER_UPLOAD} photos at a time.`)
        next.slice(MAX_FILES_PER_UPLOAD).forEach((p) => URL.revokeObjectURL(p.preview))
        return next.slice(0, MAX_FILES_PER_UPLOAD)
      }
      return next
    })
  }

  const remove = (index: number) =>
    setPicked((current) => {
      URL.revokeObjectURL(current[index].preview)
      return current.filter((_, i) => i !== index)
    })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const submit = () =>
    upload.mutate(
      { files: picked.map((p) => p.file), category, dateTaken, onProgress: setProgress },
      {
        onSuccess: (photos) => {
          toast.success(`${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} uploaded`)
          clear()
          onClose()
        },
        onError: (error) => {
          setProgress(0)
          toast.error(getErrorMessage(error, 'Upload failed. Please try again.'))
        },
      },
    )

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload Photos"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={upload.isPending}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} disabled={!picked.length || upload.isPending}>
            <CloudUpload className="size-4" />
            {upload.isPending ? `Uploading… ${progress}%` : `Upload ${picked.length || ''} ${picked.length === 1 ? 'Photo' : 'Photos'}`}
          </Button>
        </>
      }
    >
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={upload.isPending}
          className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
            dragging ? 'border-brand bg-brand-soft' : 'border-field-border bg-surface-muted hover:border-brand/50'
          }`}
        >
          <CloudUpload className="size-9 text-brand" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-ink">Drop photos here or click to choose</span>
          <span className="text-xs text-muted">
            JPG, PNG or WebP · up to {PHOTO_MAX_MB} MB each · {MAX_FILES_PER_UPLOAD} at a time
          </span>
        </button>

        {picked.length > 0 && (
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {picked.map((p, i) => (
              <li key={p.preview} className="relative">
                <img src={p.preview} alt={p.file.name} className="aspect-square w-full rounded-md object-cover" />
                {!upload.isPending && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute top-1 right-1 flex size-5.5 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-danger"
                    aria-label={`Remove ${p.file.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as GalleryCategory)}
            options={GALLERY_CATEGORIES}
          />
          <div>
            <label htmlFor="upload-date" className="form-label">
              Date Taken
            </label>
            <input id="upload-date" type="date" value={dateTaken} onChange={(e) => setDateTaken(e.target.value)} className="form-input" />
          </div>
        </div>
        <p className="text-xs text-muted">Each photo is titled after its file name. You can change titles and details afterwards.</p>

        {upload.isPending && (
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Modal>
  )
}
