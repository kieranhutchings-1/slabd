/** Mirrors the `cards` table, and so the iOS app's `Card` model. Snake_case
 *  here because these come straight back from PostgREST unmapped. */
export interface Card {
  id: string
  user_id: string | null
  category: string
  player: string
  year: string | null
  set_name: string | null
  auto_type: string | null
  serial_num: string | null
  serial_total: string | null
  serial_kind: string | null
  source: string | null
  seller: string | null
  price_paid: number | null
  date_acquired: string | null
  comp_value: number | null
  comp_notes: string | null
  status: string
  sold_price: number | null
  sold_date: string | null
  notes: string | null
  image_path: string | null
  thumb_path: string | null
  grade: string | null
  unique_serial: string | null
  break_spot_id: string | null
}

/** The shape the public `card-data` edge function returns. Deliberately a
 *  narrower set than `Card` — no prices, seller or notes — so the
 *  verification page can never render something private. */
export interface PublicCard {
  player: string
  year: string | null
  setName: string | null
  autoType: string | null
  serialNum: string | null
  serialTotal: string | null
  serialKind: string | null
  grade: string | null
  uniqueSerial: string
  imageUrl: string | null
}

export const SERIAL_KIND = {
  base: 'Base',
  serial: 'Serial',
  ssp: 'SSP',
  caseHit: 'Case Hit',
} as const

export const STATUS = {
  kept: 'Kept',
  forSale: 'For Sale',
  sold: 'Sold',
} as const

/** PSA-style grade names, matching `VaultSlabFrame.gradeNames` in the app. */
export const GRADE_NAMES: Record<string, string> = {
  '10': 'Gem Mint',
  '9': 'Mint',
  '8': 'NM-MT',
  '7': 'Near Mint',
  '6': 'EX-MT',
  '5': 'Excellent',
  '4': 'VG-EX',
  '3': 'Very Good',
  '2': 'Good',
  '1': 'Poor',
}

export const gradeName = (grade: string | null | undefined) =>
  (grade && GRADE_NAMES[grade]) || 'Graded'
