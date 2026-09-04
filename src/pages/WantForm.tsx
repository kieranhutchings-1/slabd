import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { CategoryPicker } from '../components/CategoryPicker'
import { Field, Section, Select, TextArea, TextInput } from '../components/Field'
import { useWants } from '../hooks/useWants'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'
import { AUTO_TYPES } from '../lib/options'
import { PRIORITIES } from '../lib/wants'

const str = (v: string) => (v.trim() === '' ? null : v.trim())
const num = (v: string) => {
  const n = Number(v.replace(/[^0-9.-]/g, ''))
  return v.trim() === '' || Number.isNaN(n) ? null : n
}

export function WantForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { wants, loading } = useWants()
  const { categories } = useCategories()

  const [category, setCategory] = useState('')
  const [player, setPlayer] = useState('')
  const [year, setYear] = useState('')
  const [setName, setSetName] = useState('')
  const [autoType, setAutoType] = useState('On Card Auto')
  const [serialWanted, setSerialWanted] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [seenAt, setSeenAt] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existing = useMemo(() => wants.find((w) => w.id === id), [wants, id])

  useEffect(() => {
    if (!existing) return
    setCategory(existing.category ?? '')
    setPlayer(existing.player ?? '')
    setYear(existing.year ?? '')
    setSetName(existing.set_name ?? '')
    setAutoType(existing.auto_type ?? 'On Card Auto')
    setSerialWanted(existing.serial_wanted ?? '')
    setMaxPrice(existing.max_price == null ? '' : String(existing.max_price))
    setPriority(existing.priority ?? 'Medium')
    setSeenAt(existing.seen_at ?? '')
    setNotes(existing.notes ?? '')
  }, [existing])

  useEffect(() => {
    if (editing || category || categories.length === 0) return
    setCategory(categories[0].name)
  }, [editing, category, categories])

  async function save() {
    if (!player.trim()) {
      setError('A want needs a player or character.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      category,
      player: player.trim(),
      year: str(year),
      set_name: str(setName),
      auto_type: str(autoType),
      serial_wanted: str(serialWanted),
      max_price: num(maxPrice),
      priority,
      seen_at: str(seenAt),
      notes: str(notes),
    }

    if (editing) {
      const { error } = await supabase.from('wants').update(payload).eq('id', id!)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { data: auth } = await supabase.auth.getUser()
      const { error } = await supabase.from('wants').insert({
        ...payload,
        user_id: auth.user?.id,
        date_added: new Date().toISOString().slice(0, 10),
      })
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }
    navigate('/vault/wants')
  }

  return (
    <AppShell
      title={editing ? 'Edit want' : 'Add a want'}
      subtitle={editing ? player : 'What you are hunting, and the most you will pay.'}
    >
      <Link
        to="/vault/wants"
        className="mb-6 inline-block text-[0.86rem] text-secondary transition-colors hover:text-primary"
      >
        ← Want list
      </Link>

      {editing && loading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
        </div>
      ) : (
        <div className="max-w-xl space-y-6">
          <Section title="The card">
            <Field label="Player or character">
              <TextInput value={player} onChange={setPlayer} placeholder="Who you're after" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <CategoryPicker value={category} onChange={setCategory} />
              </Field>
              <Field label="Year">
                <TextInput value={year} onChange={setYear} placeholder="2024-2025" />
              </Field>
            </div>
            <Field label="Set">
              <TextInput value={setName} onChange={setSetName} placeholder="Topps Reverence" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select value={autoType} onChange={setAutoType} options={AUTO_TYPES} />
              </Field>
              <Field label="Print run wanted" hint="Left blank, a bought card defaults to /99.">
                <TextInput value={serialWanted} onChange={setSerialWanted} placeholder="99" />
              </Field>
            </div>
          </Section>

          <Section title="Hunting it">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Most you'll pay">
                <TextInput
                  value={maxPrice}
                  onChange={setMaxPrice}
                  inputMode="decimal"
                  placeholder="0.00"
                />
              </Field>
              <Field label="Priority">
                <Select value={priority} onChange={setPriority} options={PRIORITIES} />
              </Field>
            </div>
            <Field label="Seen at" hint="Where you spotted one — a seller, a site, a show.">
              <TextInput value={seenAt} onChange={setSeenAt} placeholder="eBay, Whatnot…" />
            </Field>
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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to want list'}
            </button>
            <Link
              to="/vault/wants"
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
