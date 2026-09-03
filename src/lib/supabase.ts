import { createClient } from '@supabase/supabase-js'

/** Same project and anon key as the iOS app. The anon key is designed to be
 *  public — it already ships inside the app binary — and row-level security
 *  is what actually protects the data, not secrecy of this string. */
export const SUPABASE_URL = 'https://nokivewntcnpjngkengl.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va2l2ZXdudGNucGpuZ2tlbmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTkxOTgsImV4cCI6MjEwMTU3NTE5OH0.O_8y6Gn42ytFBu_Ud0VanIEM-bAI_9Liz7FHtP2ZwGQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`

/** Public URL for a card photo, matching `ImageUploader.publicURL`. */
export const cardImageUrl = (path: string | null | undefined) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/card-images/${path}` : null

/** Maps a database row to the shape the shared Slab component wants. */
export function toSlabCard(c: {
  player: string
  year: string | null
  set_name: string | null
  auto_type: string | null
  serial_num: string | null
  serial_total: string | null
  serial_kind: string | null
  grade: string | null
  unique_serial: string | null
  image_path: string | null
}) {
  return {
    player: c.player,
    year: c.year,
    setName: c.set_name,
    autoType: c.auto_type,
    serialNum: c.serial_num,
    serialTotal: c.serial_total,
    serialKind: c.serial_kind,
    grade: c.grade,
    uniqueSerial: c.unique_serial,
    imageUrl: cardImageUrl(c.image_path),
  }
}
