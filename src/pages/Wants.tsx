import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useWants } from '../hooks/useWants'
import { supabase } from '../lib/supabase'
import { money } from '../lib/format'
import {
  PRIORITIES,
  isBelowTarget,
  orderWants,
  wantBudget,
  wantToCardPrefill,
  type WantItem,
} from '../lib/wants'

function PriorityPill({ priority }: { priority: string }) {
  const tone =
    priority === 'High'
      ? 'border-loss/60 text-loss'
      : priority === 'Medium'
        ? 'border-brass/60 text-brass-bright'
        : 'border-hairline text-tertiary'
  return (
    <span className={`shrink-0 rounded border px-2 py-0.5 text-[0.7rem] tracking-wide ${tone}`}>
      {priority}
    </span>
  )
}

export function Wants() {
  const { wants, loading, error, reload } = useWants()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('All')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orderWants(
      wants.filter((w) => {
        if (priority !== 'All' && w.priority !== priority) return false
        if (!q) return true
        return [w.player, w.year, w.set_name, w.notes]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q))
      }),
    )
  }, [wants, query, priority])

  const budget = wantBudget(wants)
  const belowTarget = wants.filter(isBelowTarget).length

  /** Prefills a new card from the want and hands it over. The want is left in
   *  place deliberately — same as the app — so you confirm the purchase saved
   *  before dropping it off the list. */
  function markBought(w: WantItem) {
    navigate('/vault/cards/new', { state: { prefill: wantToCardPrefill(w) } })
  }

  async function remove(id: string) {
    await supabase.from('wants').delete().eq('id', id)
    setPendingDelete(null)
    await reload()
  }

  return (
    <AppShell
      title="Want list"
      subtitle="The cards you're hunting, and what you'll pay for them."
      search={query}
      onSearch={setQuery}
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {['All', ...PRIORITIES].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[0.84rem] transition-colors ${
              priority === p
                ? 'bg-gradient-to-b from-brass-bright to-brass font-medium text-ink'
                : 'border border-hairline text-secondary hover:text-primary'
            }`}
          >
            {p}
          </button>
        ))}
        <span className="flex-1" />
        <Link
          to="/vault/wants/new"
          className="rounded-full bg-gradient-to-b from-brass-bright to-brass px-4 py-1.5 text-[0.84rem] font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Add a want
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-loss/40 bg-loss/10 p-4 text-[0.88rem] text-loss">
          Couldn't load your want list: {error}
        </p>
      )}

      {!loading && !error && wants.length === 0 && (
        <div className="rounded-2xl border border-hairline bg-surface py-16 text-center">
          <p className="text-[0.95rem] text-secondary">Your want list is empty</p>
          <p className="mx-auto mt-2 max-w-md text-[0.85rem] text-tertiary">
            Track the cards you're hunting, with a ceiling on what you'll pay, so you know a good
            price when you see one.
          </p>
          <Link
            to="/vault/wants/new"
            className="mt-6 inline-block rounded-full bg-gradient-to-b from-brass-bright to-brass px-5 py-2 text-[0.86rem] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Add a want
          </Link>
        </div>
      )}

      {!loading && !error && wants.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 rounded-2xl border border-hairline bg-surface px-6 py-5">
            <p className="text-[0.9rem] text-primary">
              <span className="figures font-display text-[1.3rem] font-bold">{wants.length}</span>{' '}
              on the list
            </p>
            <p className="text-[0.86rem] text-secondary">
              Budget if you bought it all:{' '}
              <span className="figures text-primary">{money(budget)}</span>
            </p>
            {belowTarget > 0 && (
              <p className="figures text-[0.86rem] text-gain">
                {belowTarget} below target price
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-[0.9rem] text-tertiary">Nothing matches that.</p>
          ) : (
            <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
              {filtered.map((w) => (
                <li key={w.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <Link
                          to={`/vault/wants/${w.id}/edit`}
                          className="truncate text-[0.95rem] font-medium text-primary transition-colors hover:text-brass-bright"
                        >
                          {w.player}
                        </Link>
                        <PriorityPill priority={w.priority} />
                        {isBelowTarget(w) && (
                          <span className="shrink-0 rounded border border-gain/60 px-2 py-0.5 text-[0.7rem] text-gain">
                            Below target
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[0.8rem] text-secondary">
                        {[w.year, w.set_name, w.auto_type, w.category]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {w.seen_at && (
                        <p className="mt-0.5 truncate text-[0.76rem] text-tertiary">
                          Seen at {w.seen_at}
                        </p>
                      )}
                      {w.last_checked_price != null && (
                        <p className="figures mt-0.5 text-[0.76rem] text-tertiary">
                          Last checked {money(w.last_checked_price)}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="figures text-[0.92rem] text-primary">
                        {w.max_price == null ? '—' : money(w.max_price)}
                      </p>
                      <p className="text-[0.72rem] text-tertiary">max</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.8rem]">
                    <button
                      onClick={() => markBought(w)}
                      className="cursor-pointer text-brass-bright transition-opacity hover:opacity-80"
                    >
                      Mark as bought
                    </button>
                    <Link
                      to={`/vault/wants/${w.id}/edit`}
                      className="text-secondary transition-colors hover:text-primary"
                    >
                      Edit
                    </Link>
                    {pendingDelete === w.id ? (
                      <>
                        <button
                          onClick={() => remove(w.id)}
                          className="cursor-pointer text-loss transition-opacity hover:opacity-80"
                        >
                          Confirm remove
                        </button>
                        <button
                          onClick={() => setPendingDelete(null)}
                          className="cursor-pointer text-secondary transition-colors hover:text-primary"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setPendingDelete(w.id)}
                        className="cursor-pointer text-secondary transition-colors hover:text-loss"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppShell>
  )
}
