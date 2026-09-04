export interface Category {
  id: string
  user_id: string
  name: string
  sort_order: number
}

/** Canonical names offered as you type in "add category".
 *
 *  These are suggestions, never a restriction — anything can be typed. The
 *  point is convention: if most people accept the offered spelling then
 *  categories stay comparable across users, which is what makes any
 *  cross-collection feature (a trending-hits feed, say) possible at all.
 *  Constraining the list instead would fence out whoever collects the
 *  fourteenth thing. */
export const CATEGORY_SUGGESTIONS = [
  'Football',
  'NFL',
  'NBA',
  'MLB',
  'NHL',
  'WWE',
  'AEW',
  'UFC',
  'Boxing',
  'F1',
  'Cricket',
  'Rugby',
  'Tennis',
  'Golf',
  'Pokemon',
  'One Piece',
  'MTG',
  'Yu-Gi-Oh',
  'Dragon Ball',
  'Digimon',
  'Lorcana',
  'Marvel',
  'DC',
  'Disney',
  'Star Wars',
  'Garbage Pail Kids',
  'Other',
] as const

/** Suggestions worth offering: matches what's typed, minus anything already
 *  on the user's list. */
export function suggestCategories(query: string, existing: string[]): string[] {
  const q = query.trim().toLowerCase()
  const taken = new Set(existing.map((e) => e.toLowerCase()))
  return CATEGORY_SUGGESTIONS.filter(
    (s) => !taken.has(s.toLowerCase()) && (q === '' || s.toLowerCase().includes(q)),
  ).slice(0, 8)
}
