import { supabase } from './supabase'

const BUCKET = 'card-images'

/** Longest edge, in pixels, that an uploaded photo is reduced to.
 *
 *  A card is shown at a few hundred pixels at most — in the slab, in the
 *  list, on the public page. A modern phone camera produces something like
 *  4000px and 5MB, so uploading the original would cost the user's storage
 *  quota and every viewer's bandwidth for detail no one ever sees. 2400
 *  still allows a full-screen look on a retina display. */
const MAX_EDGE = 2400

/** Longest edge of the list-sized copy.
 *
 *  List rows show the photo at about 44pt, so 400px covers a 3x display with
 *  room to spare and is reusable for a grid view. At this size the file lands
 *  around 30–50KB against 400KB-plus for the full image, which is the whole
 *  point. */
const THUMB_EDGE = 400
const THUMB_QUALITY = 0.7

/** JPEG quality, matching the iOS app's 0.82 so photos added from either
 *  side look the same. */
const QUALITY = 0.82

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

/** Re-encodes a chosen file as a right-sized JPEG.
 *
 *  Falls back to the original file if the browser can't decode it — better
 *  to upload something large than to refuse a photo that would have been
 *  fine. HEIC from an iPhone is the usual case: Safari decodes it, other
 *  browsers don't, and Supabase serves it back untouched either way. */
async function prepare(file: File): Promise<{ full: Blob; thumb: Blob | null }> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Undecodable here (HEIC outside Safari, usually). Upload the original
    // rather than refuse a photo that would have been fine, and go without a
    // thumbnail — the full image is the documented fallback.
    return { full: file, thumb: null }
  }

  const render = async (edge: number, quality: number): Promise<Blob | null> => {
    const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, w, h)
    return new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
  }

  const full = await render(MAX_EDGE, QUALITY)
  const thumb = await render(THUMB_EDGE, THUMB_QUALITY)
  bitmap.close()
  return { full: full ?? file, thumb }
}

/** Uploads a photo and returns its storage path.
 *
 *  The path shape — `<user id>/<uuid>.jpg` — is what the app writes and what
 *  the bucket's row-level security checks: the policy compares the first
 *  folder segment against the caller's user id, so a differently shaped
 *  path is rejected outright. */
export interface UploadedImage {
  path: string
  thumbPath: string | null
}

export async function uploadCardImage(file: File, userId: string): Promise<UploadedImage> {
  const { full, thumb } = await prepare(file)
  const base = `${userId.toLowerCase()}/${crypto.randomUUID().toLowerCase()}`
  const path = `${base}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, full, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(error.message)

  // A failed thumbnail is not worth failing the save for — lists fall back to
  // the full image, which is exactly the behaviour before thumbnails existed.
  let thumbPath: string | null = null
  if (thumb) {
    const thumbCandidate = `${base}-thumb.jpg`
    const { error: thumbError } = await supabase.storage
      .from(BUCKET)
      .upload(thumbCandidate, thumb, { contentType: 'image/jpeg', upsert: false })
    if (!thumbError) thumbPath = thumbCandidate
  }

  return { path, thumbPath }
}

/** Removes a photo. Best-effort: a card that saved successfully shouldn't
 *  fail because its replaced photo lingered in the bucket. */
export async function deleteCardImage(path: string, thumbPath?: string | null): Promise<void> {
  const paths = thumbPath ? [path, thumbPath] : [path]
  await supabase.storage.from(BUCKET).remove(paths)
}
