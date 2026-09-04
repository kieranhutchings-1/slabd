import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { suggestCategories } from '../lib/categories'

const control =
  'w-full rounded-xl border border-hairline bg-raised px-3.5 py-2.5 text-[0.9rem] text-primary placeholder:text-tertiary focus:border-brass/60 focus:outline-none'

/** Your own categories, plus a way to add one without leaving the form.
 *
 *  Only the categories you actually use are listed — a shared list of every
 *  sport and franchise would bury the two options most people need. Adding is
 *  free text with canonical suggestions, so nothing is fenced off but common
 *  spellings still win by default. */
export function CategoryPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { categories, add } = useCategories()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const names = categories.map((c) => c.name)
  const suggestions = suggestCategories(draft, names)

  async function commit(name: string) {
    setBusy(true)
    setError(null)
    const err = await add(name)
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    onChange(name.trim())
    setDraft('')
    setAdding(false)
  }

  if (adding) {
    return (
      <div>
        <div className="flex gap-2">
          <input
            autoFocus
            className={control}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (draft.trim()) commit(draft)
              }
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="Marvel, NBA, One Piece…"
          />
          <button
            type="button"
            onClick={() => draft.trim() && commit(draft)}
            disabled={busy || !draft.trim()}
            className="shrink-0 cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass px-4 text-[0.86rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => commit(s)}
                disabled={busy}
                className="cursor-pointer rounded-full border border-hairline px-2.5 py-1 text-[0.78rem] text-secondary transition-colors hover:border-brass/60 hover:text-primary disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-2 text-[0.78rem] text-loss">{error}</p>}

        <button
          type="button"
          onClick={() => {
            setAdding(false)
            setError(null)
          }}
          className="mt-2 cursor-pointer text-[0.78rem] text-tertiary transition-colors hover:text-secondary"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div>
      <select
        className={`${control} cursor-pointer`}
        value={value}
        onChange={(e) => {
          if (e.target.value === '__add__') setAdding(true)
          else onChange(e.target.value)
        }}
      >
        {/* A category the card already carries but which isn't on the list
            any more still has to be selectable, or opening the form would
            silently reassign it. */}
        {value && !names.includes(value) && <option value={value}>{value}</option>}
        {names.length === 0 && <option value="">Add your first category…</option>}
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
        <option value="__add__">+ Add a category…</option>
      </select>
    </div>
  )
}
