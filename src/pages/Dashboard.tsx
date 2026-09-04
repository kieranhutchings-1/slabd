import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useCards } from '../hooks/useCards'
import { deriveStats } from '../lib/stats'
import { money } from '../lib/format'
import { cardThumbUrl } from '../lib/supabase'
import { useSnapshots } from '../hooks/useSnapshots'
import { ValueChart } from '../components/ValueChart'

/** A headline number. No plot, because a single value has nothing to compare
 *  against — a chart here would be decoration. */
function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note?: string
  tone?: 'gain' | 'loss'
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-[0.8rem] text-secondary">{label}</p>
      <p
        className={`figures font-display mt-2 text-[1.85rem] leading-none font-bold ${
          tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-primary'
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-[0.78rem] text-tertiary">{note}</p>}
    </div>
  )
}

/** Value by category. One measure across a handful of categories, so the bars
 *  carry magnitude and the labels carry identity — a single brass hue is
 *  correct here, and colour is doing no work that the labels don't already
 *  do. Every bar is directly labelled, since there are few enough to fit. */
function CategoryBars({ data }: { data: { label: string; value: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${money(d.value)} across ${d.count} cards`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[0.86rem] text-primary">{d.label}</span>
            <span className="figures text-[0.86rem] text-secondary">
              {money(d.value)}
              <span className="ml-2 text-tertiary">
                {d.count} card{d.count === 1 ? '' : 's'}
              </span>
            </span>
          </div>
          {/* Thin mark, rounded data-end, anchored to a common baseline. */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-brass transition-[width] duration-500"
              style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Panel({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-6">
      <h2 className="font-display text-[1.05rem] font-bold text-primary">{title}</h2>
      {note && <p className="mt-1 text-[0.8rem] text-tertiary">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Dashboard() {
  const { cards, loading, error } = useCards()
  const { snapshots, loading: snapshotsLoading } = useSnapshots()
  const s = deriveStats(cards)

  return (
    <AppShell title="Dashboard" subtitle="Everything you own, and what it's worth.">
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

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Cards" value={String(s.count)} note="In your vault" />
            <Stat
              label="Collection value"
              value={money(s.heldValue)}
              note="Comp value of cards still held"
            />
            <Stat label="Total paid" value={money(s.totalPaid)} note="Across every card" />
            {/* Sign and wording carry the meaning, not the colour: green and
                red are indistinguishable to red-green colourblind readers. */}
            <Stat
              label={s.profit >= 0 ? 'Profit' : 'Loss'}
              value={`${s.profit >= 0 ? '+' : '−'}${money(Math.abs(s.profit))}`}
              note={s.profit >= 0 ? 'Up on what you paid' : 'Down on what you paid'}
              tone={s.profit >= 0 ? 'gain' : 'loss'}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Value by category"
              note={`Held cards only · average ${money(s.averageValue)} per card`}
            >
              {s.byCategory.length ? (
                <CategoryBars data={s.byCategory} />
              ) : (
                <p className="text-[0.88rem] text-tertiary">No comp values recorded yet.</p>
              )}
            </Panel>

            <Panel title="Most valuable" note="Held cards, by comp value">
              {s.topCards.length ? (
                <ul className="space-y-3">
                  {s.topCards.map((c) => (
                    <li key={c.id} className="flex items-center gap-3">
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-raised">
                        {cardThumbUrl(c) && (
                          <img
                            src={cardThumbUrl(c)!}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.88rem] text-primary">{c.player}</p>
                        <p className="truncate text-[0.76rem] text-tertiary">
                          {[c.year, c.set_name].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <span className="figures shrink-0 text-[0.88rem] text-secondary">
                        {money(c.comp_value)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.88rem] text-tertiary">No comp values recorded yet.</p>
              )}
            </Panel>
          </div>

          <Panel
            title="Value over time"
            note={
              snapshots.length > 1
                ? 'Recorded once a night. The gap between the two lines is your profit.'
                : undefined
            }
          >
            {snapshotsLoading ? (
              <div className="flex justify-center py-10">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
              </div>
            ) : snapshots.length > 1 ? (
              <ValueChart data={snapshots} />
            ) : (
              // One point isn't a trend, and drawing it as one would be a lie.
              <p className="py-6 text-[0.88rem] text-tertiary">
                Tracking started today. Your collection's value is recorded every night, so this
                chart fills in over the next few days.
              </p>
            )}
          </Panel>

          <Panel title="Status">
            <div className="flex flex-wrap gap-8">
              {s.byStatus.map((st) => (
                <div key={st.label}>
                  <p className="figures font-display text-[1.4rem] font-bold text-primary">
                    {st.count}
                  </p>
                  <p className="text-[0.8rem] text-secondary">{st.label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/vault/cards"
              className="mt-6 inline-block text-[0.86rem] text-brass-bright transition-opacity hover:opacity-80"
            >
              See all cards →
            </Link>
          </Panel>
        </div>
      )}
    </AppShell>
  )
}
