import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useCards } from '../hooks/useCards'
import { cardImageUrl } from '../lib/supabase'
import { money, profitLoss } from '../lib/format'
import { gradeName } from '../lib/types'
import { DEFAULT_SORT, SORTS, sortCards, type Sort } from '../lib/sort'

const CATEGORIES = ['All', 'Football', 'WWE', 'Pokemon', 'Other']

/** The serial designation, as a compact badge for list rows. */
function Tag({ card }: { card: { serial_kind: string | null; serial_num: string | null; serial_total: string | null; grade: string | null } }) {
  const label = card.grade
    ? `Grade ${card.grade}`
    : card.serial_kind === 'Base'
      ? 'Base'
      : card.serial_kind === 'SSP'
        ? 'SSP'
        : card.serial_kind === 'Case Hit'
          ? 'Case Hit'
          : card.serial_num
            ? `${card.serial_num}/${card.serial_total || '?'}`
            : '—'

  return (
    <span className="font-display shrink-0 rounded border border-brass/60 px-2 py-0.5 text-[0.7rem] tracking-wide text-brass-bright">
      {label}
    </span>
  )
}

export function Cards() {
  const { cards, loading, error } = useCards()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  // Remembered per browser, the way the app remembers it per device — a
  // chosen order is a preference, not a one-off.
  const [sort, setSort] = useState<Sort>(() => {
    try {
      const saved = localStorage.getItem('slabd.sort')
      return SORTS.includes(saved as Sort) ? (saved as Sort) : DEFAULT_SORT
    } catch {
      return DEFAULT_SORT
    }
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = cards.filter((c) => {
      if (category !== 'All' && c.category !== category) return false
      if (!q) return true
      return [c.player, c.year, c.set_name, c.auto_type, c.seller, c.unique_serial]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q))
    })
    return sortCards(matches, sort)
  }, [cards, query, category, sort])

  return (
    <AppShell
      title="My cards"
      subtitle={`${cards.length} card${cards.length === 1 ? '' : 's'} in your vault`}
      search={query}
      onSearch={setQuery}
    >
      {/* Filters sit in one row above the content. */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[0.84rem] transition-colors ${
              category === c
                ? 'bg-gradient-to-b from-brass-bright to-brass font-medium text-ink'
                : 'border border-hairline text-secondary hover:text-primary'
            }`}
          >
            {c}
          </button>
        ))}
        <span className="flex-1" />
        <label className="flex items-center gap-2 text-[0.84rem] text-secondary">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => {
              const next = e.target.value as Sort
              setSort(next)
              try {
                localStorage.setItem('slabd.sort', next)
              } catch {
                // A browser with site data blocked still sorts; it just
                // won't remember the choice next visit.
              }
            }}
            className="cursor-pointer rounded-full border border-hairline bg-surface px-4 py-1.5 text-[0.84rem] text-secondary transition-colors hover:text-primary focus:border-brass/60 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <Link
          to="/vault/data"
          className="rounded-full border border-hairline px-4 py-1.5 text-[0.84rem] text-secondary transition-colors hover:text-primary"
        >
          Import / export
        </Link>
        <Link
          to="/vault/cards/new"
          className="rounded-full bg-gradient-to-b from-brass-bright to-brass px-4 py-1.5 text-[0.84rem] font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Add card
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-loss/40 bg-loss/10 p-4 text-[0.88rem] text-loss">
          Couldn't load your collection: {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="py-16 text-center text-[0.9rem] text-tertiary">
          {cards.length ? 'No cards match that.' : 'No cards yet. Add one to get started.'}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
          {filtered.map((c) => {
            const pl = profitLoss(c)
            return (
              <li key={c.id}>
                <Link
                  to={`/vault/cards/${c.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-raised/60"
                >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-raised">
                  {cardImageUrl(c.image_path) && (
                    <img
                      src={cardImageUrl(c.image_path)!}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <p className="truncate text-[0.95rem] font-medium text-primary">{c.player}</p>
                    <Tag card={c} />
                  </div>
                  <p className="mt-0.5 truncate text-[0.8rem] text-secondary">
                    {[c.year, c.set_name, c.auto_type].filter(Boolean).join(' · ')}
                  </p>
                  {c.grade && (
                    <p className="mt-0.5 text-[0.74rem] text-tertiary">{gradeName(c.grade)}</p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="figures text-[0.92rem] text-primary">{money(c.comp_value)}</p>
                  <p
                    className={`figures text-[0.78rem] ${pl >= 0 ? 'text-gain' : 'text-loss'}`}
                    title={pl >= 0 ? 'Up on what you paid' : 'Down on what you paid'}
                  >
                    {pl >= 0 ? '+' : '−'}
                    {money(Math.abs(pl))}
                  </p>
                </div>

                <span className="shrink-0 text-tertiary">›</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </AppShell>
  )
}
