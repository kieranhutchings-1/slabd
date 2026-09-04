import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Field, TextInput } from '../components/Field'
import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import { useBreaks } from '../hooks/useBreaks'
import { useWants } from '../hooks/useWants'
import { useCategories } from '../hooks/useCategories'
import { suggestCategories } from '../lib/categories'
import { supabase } from '../lib/supabase'

const MIN_PASSWORD = 8

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
      {note && <p className="mt-1 text-[0.82rem] leading-relaxed text-tertiary">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** Add, rename, reorder and remove your own categories.
 *
 *  Rename is the important one: in a user-led list typos are inevitable, and
 *  without this, fixing one would mean editing every affected card by hand. It
 *  rewrites the list entry and every card and want carrying it in a single
 *  transaction. */
function CategoryManager() {
  const { categories, add, rename, remove, reorder } = useCategories()
  const { cards } = useCards()
  const { wants } = useWants()

  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const names = categories.map((c) => c.name)
  const suggestions = suggestCategories(draft, names)
  const usage = (name: string) => ({
    cards: cards.filter((c) => c.category === name).length,
    wants: wants.filter((w) => w.category === name).length,
  })

  async function run(fn: () => Promise<string | null>) {
    setBusy(true)
    setError(null)
    const err = await fn()
    setBusy(false)
    if (err) setError(err)
    return err
  }

  return (
    <div>
      <ul className="divide-y divide-hairline">
        {categories.map((c, i) => {
          const used = usage(c.name)
          const inUse = used.cards + used.wants > 0

          return (
            <li key={c.id} className="py-3 first:pt-0">
              {editingId === c.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    className="min-w-0 flex-1 rounded-xl border border-hairline bg-raised px-3 py-2 text-[0.88rem] text-primary focus:border-brass/60 focus:outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button
                    onClick={async () => {
                      const err = await run(() => rename(c.name, editName))
                      if (!err) setEditingId(null)
                    }}
                    disabled={busy}
                    className="cursor-pointer rounded-full bg-gradient-to-b from-brass-bright to-brass px-4 py-1.5 text-[0.82rem] font-semibold text-ink disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="cursor-pointer px-2 text-[0.82rem] text-secondary hover:text-primary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9rem] text-primary">{c.name}</p>
                    <p className="mt-0.5 text-[0.74rem] text-tertiary">
                      {used.cards} card{used.cards === 1 ? '' : 's'}
                      {used.wants > 0 && ` · ${used.wants} on want list`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => reorder(moveItem(categories, i, -1))}
                      disabled={busy || i === 0}
                      title="Move up"
                      className="cursor-pointer px-1.5 text-secondary transition-colors hover:text-primary disabled:opacity-25"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => reorder(moveItem(categories, i, 1))}
                      disabled={busy || i === categories.length - 1}
                      title="Move down"
                      className="cursor-pointer px-1.5 text-secondary transition-colors hover:text-primary disabled:opacity-25"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingId(c.id)
                      setEditName(c.name)
                      setError(null)
                    }}
                    className="shrink-0 cursor-pointer text-[0.8rem] text-secondary transition-colors hover:text-primary"
                  >
                    Rename
                  </button>

                  {confirmRemove === c.id ? (
                    <>
                      <button
                        onClick={async () => {
                          await run(() => remove(c))
                          setConfirmRemove(null)
                        }}
                        disabled={busy}
                        className="shrink-0 cursor-pointer text-[0.8rem] text-loss disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="shrink-0 cursor-pointer text-[0.8rem] text-secondary hover:text-primary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(c.id)}
                      className="shrink-0 cursor-pointer text-[0.8rem] text-secondary transition-colors hover:text-loss"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {confirmRemove === c.id && inUse && (
                <p className="mt-2 text-[0.78rem] text-tertiary">
                  Removing this only takes it off the picker. The {used.cards} card
                  {used.cards === 1 ? '' : 's'} using it keep the label — rename instead if you
                  meant to change them.
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-5 border-t border-hairline pt-5">
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-hairline bg-raised px-3.5 py-2.5 text-[0.9rem] text-primary placeholder:text-tertiary focus:border-brass/60 focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key !== 'Enter' || !draft.trim()) return
              e.preventDefault()
              const err = await run(() => add(draft))
              if (!err) setDraft('')
            }}
            placeholder="Add a category — anything you collect"
          />
          <button
            onClick={async () => {
              const err = await run(() => add(draft))
              if (!err) setDraft('')
            }}
            disabled={busy || !draft.trim()}
            className="shrink-0 cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass px-5 text-[0.86rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={async () => {
                  const err = await run(() => add(s))
                  if (!err) setDraft('')
                }}
                disabled={busy}
                className="cursor-pointer rounded-full border border-hairline px-2.5 py-1 text-[0.78rem] text-secondary transition-colors hover:border-brass/60 hover:text-primary disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-[0.82rem] text-loss">{error}</p>}
      </div>
    </div>
  )
}

function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list]
  const target = index + delta
  if (target < 0 || target >= next.length) return next
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function save() {
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Those two passwords don't match.")
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setPassword('')
    setConfirm('')
    setDone(true)
  }

  return (
    <div className="max-w-sm space-y-3">
      <Field label="New password">
        <TextInput
          value={password}
          onChange={(v) => {
            setPassword(v)
            setDone(false)
          }}
          type="password"
          autoComplete="new-password"
        />
      </Field>
      <Field label="Repeat it">
        <TextInput value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" />
      </Field>
      {error && <p className="text-[0.82rem] text-loss">{error}</p>}
      {done && <p className="text-[0.82rem] text-gain">Password changed.</p>}
      <button
        onClick={save}
        disabled={busy}
        className="cursor-pointer rounded-full bg-gradient-to-b from-brass-bright to-brass px-5 py-2.5 text-[0.88rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Change password'}
      </button>
    </div>
  )
}

export function Settings() {
  const { session } = useAuth()
  const { cards } = useCards()
  const { breaks, spots } = useBreaks()
  const { wants } = useWants()
  const email = session?.user.email ?? ''

  return (
    <AppShell title="Settings" subtitle="Your account, your categories, your data.">
      <div className="max-w-3xl space-y-6">
        <Panel title="Account">
          <dl className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.84rem] text-secondary">Email</dt>
              <dd className="text-[0.88rem] text-primary">{email || '—'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.84rem] text-secondary">In your vault</dt>
              <dd className="figures text-[0.88rem] text-primary">
                {cards.length} cards · {breaks.length} breaks · {spots.length} spots ·{' '}
                {wants.length} wants
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="Categories"
          note="Your own list — only what you collect shows in the pickers. Renaming updates every card and want that carries it."
        >
          <CategoryManager />
        </Panel>

        <Panel
          title="Password"
          note="Changing it here signs you in again on this device and leaves your other devices alone."
        >
          <ChangePassword />
        </Panel>

        <Panel
          title="Your data"
          note="Everything you have entered, as a spreadsheet, in the same format the iPhone app reads."
        >
          <Link
            to="/vault/data"
            className="inline-block rounded-full border border-hairline px-5 py-2.5 text-[0.88rem] text-primary transition-colors hover:border-brass/60"
          >
            Import and export
          </Link>
        </Panel>

        <Panel
          title="Closing your account"
          note="This removes your collection, photos and account for good. It can't be undone, so it's handled by hand rather than behind a button — export your data first if you want to keep a copy."
        >
          <a
            href={`mailto:hello@slabd.app?subject=${encodeURIComponent('Close my SLABD account')}&body=${encodeURIComponent(`Please close the SLABD account registered to ${email} and delete my data.`)}`}
            className="inline-block rounded-full border border-hairline px-5 py-2.5 text-[0.88rem] text-secondary transition-colors hover:border-loss/50 hover:text-loss"
          >
            Request account deletion
          </a>
        </Panel>

        <Panel title="About">
          <p className="text-[0.88rem] leading-relaxed text-secondary">
            SLABD keeps your collection, prices it against comps, and gives every card a slab, a
            serial and a public page.
          </p>
          <p className="mt-4 text-[0.84rem] text-secondary">
            <Link to="/privacy" className="text-brass-bright transition-opacity hover:opacity-80">
              Privacy Policy
            </Link>
            <span className="px-2 text-tertiary">·</span>
            <Link to="/terms" className="text-brass-bright transition-opacity hover:opacity-80">
              Terms of Service
            </Link>
            <span className="px-2 text-tertiary">·</span>
            <a
              href="mailto:hello@slabd.app"
              className="text-brass-bright transition-opacity hover:opacity-80"
            >
              hello@slabd.app
            </a>
          </p>
        </Panel>
      </div>
    </AppShell>
  )
}
