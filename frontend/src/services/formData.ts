import type { MediaImage } from '../types/admin'

/**
 * Adds an image to an upload form: a newly picked file is uploaded, a removed image is
 * sent as remove_<field>=true (only if there was one before), an unchanged image is left out.
 */
export function appendImage(form: FormData, field: string, image: MediaImage | null, hadImage = true) {
  if (image?.file) form.append(field, image.file)
  else if (!image && hadImage) form.append(`remove_${field}`, 'true')
}

export const toImage = (url: string | null): MediaImage | null => (url ? { url } : null)
