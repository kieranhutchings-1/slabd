/** Picker options, kept in step with the enums in the iOS app's Card.swift.
 *  These are stored as raw strings in the database, so the two sides must
 *  agree exactly or a card added on the web shows a blank picker on the
 *  phone. */

export const CATEGORIES = ['Football', 'WWE', 'Pokemon', 'Other'] as const

export const AUTO_TYPES = [
  'Auto',
  'On Card Auto',
  'Dual Auto',
  'Triple Auto',
  'Quad Auto',
  'Patch Auto',
  'Relic',
  'Dual Relic',
  'Quad Relic',
  'Base / Insert',
  'Case Hit',
] as const

export const SERIAL_KINDS = ['Base', 'Serial', 'SSP', 'Case Hit'] as const

export const SOURCES = ['Single Purchase', 'Break', 'Opened Wax'] as const

export const STATUSES = ['Kept', 'For Sale', 'Sold'] as const

export const GRADES = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'] as const
