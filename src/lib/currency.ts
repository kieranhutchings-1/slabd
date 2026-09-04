export const CURRENCIES = ['GBP', 'USD', 'EUR'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  GBP: 'Pound sterling (£)',
  USD: 'US dollar ($)',
  EUR: 'Euro (€)',
}

/** Formatting locale per currency, so separators and symbol placement follow
 *  that currency's own convention rather than always reading as British. */
const LOCALES: Record<CurrencyCode, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'en-IE',
}

const STORAGE_KEY = 'slabd.currency'

/** The currency amounts are displayed in.
 *
 *  A label, not a conversion: nothing in the database records which currency a
 *  price was entered in, and there is no exchange rate anywhere in the app.
 *  Switching relabels rather than converts, because converting would silently
 *  rewrite the meaning of every historical entry against today's rate.
 *
 *  Held in a tiny external store rather than React context because `money()`
 *  is a plain function called from dozens of places, including non-component
 *  code. Reading it from module state keeps every call site unchanged; the
 *  subscription exists so the UI still updates when the setting changes.
 *
 *  Seeded from localStorage so the first paint uses the right symbol instead
 *  of flashing sterling while the database round-trips. */
let current: CurrencyCode = read()

function read(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return CURRENCIES.includes(saved as CurrencyCode) ? (saved as CurrencyCode) : 'GBP'
  } catch {
    return 'GBP'
  }
}

const listeners = new Set<() => void>()

export function subscribeCurrency(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getCurrency = (): CurrencyCode => current

export function setCurrencyLocally(code: CurrencyCode) {
  if (code === current) return
  current = code
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // A browser with site data blocked still formats correctly for this
    // session; it just won't remember on the next visit.
  }
  listeners.forEach((fn) => fn())
}

export const currencySymbol = () =>
  ({ GBP: '£', USD: '$', EUR: '€' })[current]

export function formatMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return new Intl.NumberFormat(LOCALES[current], {
    style: 'currency',
    currency: current,
  }).format(value)
}
