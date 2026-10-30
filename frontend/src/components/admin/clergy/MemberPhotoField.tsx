import { Image as ImageIcon, Trash2, UserRound } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'react-toastify'
import type { MediaImage } from '../../../types/admin'
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from '../../../utils/clergy'

interface MemberPhotoFieldProps {
  value: MediaImage | null
  onChange: (value: MediaImage | null) => void
  error?: string
}

export default function MemberPhotoField({ value, onChange, error }: MemberPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const replace = (next: MediaImage | null) => {
    if (value?.url.startsWith('blob:')) URL.revokeObjectURL(value.url)
    onChange(next)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!PHOTO_TYPES.includes(file.type)) return void toast.error('Please choose a JPG or PNG image.')
    if (file.size > PHOTO_MAX_BYTES) return void toast.error('The photo must be 2 MB or smaller.')
    replace({ url: URL.createObjectURL(file), file })
  }

  return (
    <div>
      <p className="form-label">Photo</p>
      <div className="flex items-center gap-4">
        <div className="flex h-21 w-23 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-muted">
          {value ? <img src={value.url} alt="" className="size-full object-cover" /> : <UserRound className="size-8" />}
        </div>
        <div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-brand px-4 text-[0.8125rem] font-medium text-brand hover:bg-brand-soft"
            >
              <ImageIcon className="size-4" /> {value ? 'Change Photo' : 'Upload Photo'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => replace(null)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-danger px-4 text-[0.8125rem] font-medium text-danger hover:bg-danger-soft"
              >
                <Trash2 className="size-4" /> Remove
              </button>
            )}
          </div>
          <p className="mt-2.5 text-xs text-muted">JPG, PNG up to 2MB</p>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  )
}
