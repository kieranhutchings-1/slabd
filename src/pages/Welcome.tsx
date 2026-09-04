import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Chrome'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { usePlan } from '../hooks/usePlan'
import { useCurrency } from '../hooks/useCurrency'
import { CATEGORY_SUGGESTIONS } from '../lib/categories'
import { CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from '../lib/currency'

// Widened from the const-asserted tuple so it can be tested against
// arbitrary user input.
const SUGGESTED: readonly string[] = CATEGORY_SUGGESTIONS

/** First run.
 *
 *  Categories belong to the user rather than being a fixed list, which is the
 *  right call — but it left a new account with an empty picker and no
 *  explanation, unable to file a card until they worked out they had to invent
 *  a category first. This is the fix: ask for the two things the app can't
 *  guess, and get out of the way.
 *
 *  Deliberately one screen rather than a multi-step wizard. There are only two
 *  decisions, and both are changeable in Settings afterwards, so making
 *  somebody click Next three times to reach an empty vault would be theatre. */
export function Welcome() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const { categories, loading: catsLoading, add } = useCategories()
  const { isFounding } = usePlan()
  const { currency, change } = useCurrency()

  const [picked, setPicked] = useState<string[]>([])
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Somebody who already has categories doesn't need this screen — including
  // on a second visit, or if they reach the URL directly.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!catsLoading) setSettled(true)
  }, [catsLoading])

  if (!authLoading && !session) return <Navigate to="/signin" replace />
  if (settled && categories.length > 0) return <Navigate to="/vault" replace />

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]))

  function addCustom() {
    const name = custom.trim()
    if (!name) return
    if (!picked.some((p) => p.toLowerCase() === name.toLowerCase())) {
      setPicked((p) => [...p, name])
    }
    setCustom('')
  }

  async function finish() {
    if (picked.length === 0) {
      setError('Pick at least one, or type your own. You can add more later.')
      return
    }
    setBusy(true)
    setError(null)

    // Sequentially, so the sort order matches the order they were chosen in.
    for (const name of picked) {
      const err = await add(name)
      if (err) {
        setError(err)
        setBusy(false)
        return
      }
    }
    navigate('/vault/cards/new', { replace: true })
  }

  const chip = 'cursor-pointer rounded-full px-3.5 py-1.5 text-[0.86rem] transition-colors'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,#1b2029_0%,var(--color-ink)_55%)] px-5 py-14">
      <div className="mx-auto max-w-xl">
        <Wordmark className="text-[0.95rem]" />

        <h1 className="font-display mt-9 text-[1.9rem] leading-tight font-bold text-primary">
          Welcome to your vault
        </h1>

        {isFounding ? (
          <div className="mt-4 rounded-xl border border-brass/40 bg-brass/5 p-4">
            <p className="font-display text-[0.95rem] font-bold text-brass-bright">
              You're a founding member
            </p>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-secondary">
              SLABD is in beta and free for everyone. Because you joined now, you keep the full
              version free — permanently, not for a trial period.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-secondary">
            Two quick things and you're in.
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-display text-[1.1rem] font-bold text-primary">What do you collect?</h2>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-secondary">
            Only what you pick shows up in your pickers, so the app stays about your collection and
            nobody else's. Add or rename them whenever you like.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTED.map((name) => {
              const on = picked.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  aria-pressed={on}
                  className={`${chip} ${
                    on
                      ? 'bg-gradient-to-b from-brass-bright to-brass font-medium text-ink'
                      : 'border border-hairline text-secondary hover:border-brass/50 hover:text-primary'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>

          {/* Anything they've typed that isn't on the suggested list. */}
          {picked.filter((p) => !SUGGESTED.includes(p)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {picked
                .filter((p) => !SUGGESTED.includes(p))
                .map((name) => (
                  <button
                    key={name}
                    onClick={() => toggle(name)}
                    className={`${chip} bg-gradient-to-b from-brass-bright to-brass font-medium text-ink`}
                  >
                    {name} ×
                  </button>
                ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustom()
                }
              }}
              placeholder="Something else you collect"
              className="min-w-0 flex-1 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-[0.9rem] text-primary placeholder:text-tertiary focus:border-brass/60 focus:outline-none"
            />
            <button
              onClick={addCustom}
              disabled={!custom.trim()}
              className="cursor-pointer rounded-xl border border-hairline px-4 text-[0.86rem] text-secondary transition-colors hover:text-primary disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-[1.1rem] font-bold text-primary">
            What currency do you buy in?
          </h2>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-secondary">
            This sets the symbol on your amounts. It doesn't convert anything — SLABD records what
            you paid, in the currency you paid it.
          </p>
          <select
            value={currency}
            onChange={(e) => change(e.target.value as CurrencyCode)}
            className="mt-4 w-full max-w-xs cursor-pointer rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-[0.9rem] text-primary focus:border-brass/60 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
        </section>

        {error && <p className="mt-6 text-[0.86rem] text-loss">{error}</p>}

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-hairline pt-7">
          <button
            onClick={finish}
            disabled={busy}
            className="cursor-pointer rounded-full bg-gradient-to-b from-brass-bright to-brass px-6 py-3 text-[0.92rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Setting up…' : 'Add my first card'}
          </button>
          <span className="text-[0.82rem] text-tertiary">
            {picked.length === 0
              ? 'Pick what you collect to carry on'
              : `${picked.length} categor${picked.length === 1 ? 'y' : 'ies'} — change them any time in Settings`}
          </span>
        </div>
      </div>
    </div>
  )
}
