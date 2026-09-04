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
async function prepare(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  )
  return blob ?? file
}

/** Uploads a photo and returns its storage path.
 *
 *  The path shape — `<user id>/<uuid>.jpg` — is what the app writes and what
 *  the bucket's row-level security checks: the policy compares the first
 *  folder segment against the caller's user id, so a differently shaped
 *  path is rejected outright. */
export async function uploadCardImage(file: File, userId: string): Promise<string> {
  const body = await prepare(file)
  const path = `${userId.toLowerCase()}/${crypto.randomUUID().toLowerCase()}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType: 'image/jpeg', upsert: false })

  if (error) throw new Error(error.message)
  return path
}

/** Removes a photo. Best-effort: a card that saved successfully shouldn't
 *  fail because its replaced photo lingered in the bucket. */
export async function deleteCardImage(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}
