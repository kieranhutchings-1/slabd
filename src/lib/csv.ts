import type { Card } from './types'

/** Column order matching `Card.csvColumns` in the iOS app, so a file exported
 *  from either side imports cleanly into the other.
 *
 *  `grade` is appended beyond the app's list: it postdates that code, and both
 *  importers key off the header rather than position, so an extra column is
 *  ignored rather than misread. `unique_serial` is exported for reference but
 *  never imported — it's database-assigned and unique-constrained, so writing
 *  it back would either collide or hand one card another's identity. */
export const CSV_COLUMNS = [
  'id',
  'player',
  'category',
  'year',
  'set_name',
  'auto_type',
  'serial_num',
  'serial_total',
  'serial_kind',
  'source',
  'seller',
  'price_paid',
  'date_acquired',
  'comp_value',
  'comp_notes',
  'status',
  'sold_price',
  'sold_date',
  'notes',
  'grade',
  'unique_serial',
] as const

/** Columns a row may write. Excludes the two the database owns. */
const IMPORTABLE = CSV_COLUMNS.filter((c) => c !== 'id' && c !== 'unique_serial')

const NUMERIC = new Set(['price_paid', 'comp_value', 'sold_price'])

const escape = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

export function encodeCSV(cards: Card[]): string {
  const rows = [
    CSV_COLUMNS.join(','),
    ...cards.map((c) =>
      CSV_COLUMNS.map((col) => {
        const v = (c as unknown as Record<string, unknown>)[col]
        return escape(v == null ? '' : String(v))
      }).join(','),
    ),
  ]
  // CRLF, matching the app's encoder.
  return rows.join('\r\n')
}

/** RFC 4180 parse: handles quoted fields containing commas, quotes and
 *  newlines, which a naive split on ',' silently corrupts. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let i = 0

  // Strip a UTF-8 BOM, which Excel adds and which would otherwise become
  // part of the first header name and break column matching.
  if (text.charCodeAt(0) === 0xfeff) i = 1

  for (; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\r') {
      // swallow; the \n handles the break
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

export interface ParsedRow {
  id: string | null
  values: Record<string, string | number | null>
}

/** Turns CSV text into per-row update payloads.
 *
 *  Only columns actually present in the header are included. That matters:
 *  a file exported from the app has no `grade` column, and if a missing
 *  column were treated as an empty value, importing it would silently wipe
 *  the grade off every graded card. */
export function parseCards(text: string): { rows: ParsedRow[]; skipped: number } {
  const raw = parseCSV(text)
  if (!raw.length) return { rows: [], skipped: 0 }

  const header = raw[0].map((h) => h.trim())
  const present = IMPORTABLE.filter((c) => header.includes(c))
  const idIndex = header.indexOf('id')

  const rows: ParsedRow[] = []
  let skipped = 0

  for (const line of raw.slice(1)) {
    const get = (col: string) => {
      const idx = header.indexOf(col)
      return idx >= 0 && idx < line.length ? line[idx].trim() : ''
    }

    // A row with no player is not a card. The app applies the same rule.
    if (!get('player')) {
      skipped++
      continue
    }

    const values: Record<string, string | number | null> = {}
    for (const col of present) {
      const v = get(col)
      values[col] = v === '' ? null : NUMERIC.has(col) ? (Number(v) || null) : v
    }

    const id = idIndex >= 0 ? line[idIndex]?.trim() || null : null
    rows.push({ id: id && /^[0-9a-f-]{36}$/i.test(id) ? id : null, values })
  }

  return { rows, skipped }
}
