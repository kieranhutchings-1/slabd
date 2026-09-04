import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Field, Section, TextArea, TextInput } from '../components/Field'
import { useBreaks } from '../hooks/useBreaks'
import { supabase } from '../lib/supabase'

const str = (v: string) => (v.trim() === '' ? null : v.trim())

export function BreakForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { breaks, loading } = useBreaks()

  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [seller, setSeller] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existing = useMemo(() => breaks.find((b) => b.id === id), [breaks, id])

  // Sellers you've bought breaks from, so a repeat purchase is a pick rather
  // than a retype — and so the seller breakdown doesn't fragment over
  // spelling variants.
  const knownSellers = useMemo(() => {
    const seen: string[] = []
    for (const b of breaks) {
      const s = (b.seller ?? '').trim()
      if (s && !seen.includes(s)) seen.push(s)
    }
    return seen
  }, [breaks])

  useEffect(() => {
    if (!existing) return
    setName(existing.name ?? '')
    setDate(existing.break_date ?? '')
    setSeller(existing.seller ?? '')
    setNotes(existing.notes ?? '')
  }, [existing])

  async function save() {
    if (!name.trim()) {
      setError('A break needs a name.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      name: name.trim(),
      break_date: str(date),
      seller: str(seller),
      notes: str(notes),
    }

    if (editing) {
      const { error } = await supabase.from('breaks').update(payload).eq('id', id!)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      navigate(`/vault/breaks/${id}`)
    } else {
      const { data: auth } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('breaks')
        .insert({ ...payload, user_id: auth.user?.id })
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      navigate(`/vault/breaks/${data.id}`)
    }
  }

  return (
    <AppShell
      title={editing ? 'Edit break' : 'Add a break'}
      subtitle={editing ? undefined : 'A break holds the spots you paid for. Add those next.'}
    >
      <Link
        to={editing ? `/vault/breaks/${id}` : '/vault/breaks'}
        className="mb-6 inline-block text-[0.86rem] text-secondary transition-colors hover:text-primary"
      >
        ← Back
      </Link>

      {editing && loading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
        </div>
      ) : (
        <div className="max-w-xl space-y-6">
          <Section title="Break">
            <Field label="Name">
              <TextInput
                value={name}
                onChange={setName}
                placeholder="Topps Chrome WWE 8-box PYT"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of the break">
                <TextInput value={date} onChange={setDate} type="date" />
              </Field>
              <Field
                label="Seller"
                hint={knownSellers.length ? 'Pick a seller you have used before.' : undefined}
              >
                <TextInput
                  value={seller}
                  onChange={setSeller}
                  placeholder="Breaker or shop"
                  list="known-break-sellers"
                />
                <datalist id="known-break-sellers">
                  {knownSellers.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Notes">
              <TextArea value={notes} onChange={setNotes} rows={3} />
            </Field>
          </Section>

          {error && (
            <p className="rounded-xl border border-loss/40 bg-loss/10 p-4 text-[0.88rem] text-loss">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="cursor-pointer rounded-full bg-gradient-to-b from-brass-bright to-brass px-6 py-2.5 text-[0.9rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add break'}
            </button>
            <Link
              to={editing ? `/vault/breaks/${id}` : '/vault/breaks'}
              className="text-[0.88rem] text-secondary transition-colors hover:text-primary"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  )
}
