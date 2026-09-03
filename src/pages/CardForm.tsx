import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Slab } from '../components/Slab'
import { Field, Section, Select, TextArea, TextInput, Toggle } from '../components/Field'
import { useCard } from '../hooks/useCard'
import { useCards } from '../hooks/useCards'
import { supabase } from '../lib/supabase'
import { AUTO_TYPES, CATEGORIES, GRADES, SERIAL_KINDS, SOURCES, STATUSES } from '../lib/options'
import { gradeName } from '../lib/types'

interface Draft {
  player: string
  category: string
  year: string
  set_name: string
  auto_type: string
  serial_num: string
  serial_total: string
  serial_kind: string
  grade: string
  source: string
  seller: string
  price_paid: string
  date_acquired: string
  comp_value: string
  comp_notes: string
  status: string
  sold_price: string
  sold_date: string
  notes: string
}

const EMPTY: Draft = {
  player: '',
  category: 'Football',
  year: '',
  set_name: '',
  auto_type: 'Auto',
  serial_num: '',
  serial_total: '',
  serial_kind: 'Base',
  grade: '',
  source: 'Single Purchase',
  seller: '',
  price_paid: '',
  date_acquired: new Date().toISOString().slice(0, 10),
  comp_value: '',
  comp_notes: '',
  status: 'Kept',
  sold_price: '',
  sold_date: '',
  notes: '',
}

const num = (v: string) => {
  const n = Number(v.replace(/[^0-9.-]/g, ''))
  return v.trim() === '' || Number.isNaN(n) ? null : n
}
const str = (v: string) => (v.trim() === '' ? null : v.trim())

export function CardForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { card, loading } = useCard(id)
  const { cards } = useCards()

  const [d, setD] = useState<Draft>(EMPTY)
  const [graded, setGraded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sets already used, most-recently-added first, matching the app's picker
  // order so the set you're working through stays at the top.
  const knownSets = useMemo(() => {
    const seen: string[] = []
    for (const c of cards) if (c.set_name && !seen.includes(c.set_name)) seen.push(c.set_name)
    return seen
  }, [cards])

  useEffect(() => {
    if (!card) return
    setD({
      player: card.player ?? '',
      category: card.category ?? 'Football',
      year: card.year ?? '',
      set_name: card.set_name ?? '',
      auto_type: card.auto_type ?? 'Auto',
      serial_num: card.serial_num ?? '',
      serial_total: card.serial_total ?? '',
      serial_kind: card.serial_kind ?? 'Base',
      grade: card.grade ?? '',
      source: card.source ?? 'Single Purchase',
      seller: card.seller ?? '',
      price_paid: card.price_paid == null ? '' : String(card.price_paid),
      date_acquired: card.date_acquired ?? '',
      comp_value: card.comp_value == null ? '' : String(card.comp_value),
      comp_notes: card.comp_notes ?? '',
      status: card.status ?? 'Kept',
      sold_price: card.sold_price == null ? '' : String(card.sold_price),
      sold_date: card.sold_date ?? '',
      notes: card.notes ?? '',
    })
    setGraded(Boolean(card.grade))
  }, [card])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  async function save() {
    if (!d.player.trim()) {
      setError('A card needs a player name.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      player: d.player.trim(),
      category: d.category,
      year: str(d.year),
      set_name: str(d.set_name),
      auto_type: str(d.auto_type),
      serial_num: str(d.serial_num),
      serial_total: str(d.serial_total),
      serial_kind: d.serial_kind,
      // Clearing the toggle must clear the stored grade, or an ungraded card
      // keeps rendering a grade block on its slab.
      grade: graded ? str(d.grade) : null,
      source: str(d.source),
      seller: str(d.seller),
      price_paid: num(d.price_paid),
      date_acquired: str(d.date_acquired),
      comp_value: num(d.comp_value),
      comp_notes: str(d.comp_notes),
      status: d.status,
      sold_price: num(d.sold_price),
      sold_date: str(d.sold_date),
      notes: str(d.notes),
    }

    if (editing) {
      const { error } = await supabase.from('cards').update(payload).eq('id', id!)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      navigate(`/vault/cards/${id}`)
    } else {
      // user_id has to be set explicitly: the row-level security policy checks
      // it, and the database has no default for it.
      const { data: auth } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('cards')
        .insert({ ...payload, user_id: auth.user?.id })
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      navigate(`/vault/cards/${data.id}`)
    }
  }

  // Live slab preview, so the label is checkable before saving.
  const preview = {
    player: d.player || 'Player name',
    year: d.year,
    setName: d.set_name,
    autoType: d.auto_type,
    serialNum: d.serial_num,
    serialTotal: d.serial_total,
    serialKind: d.serial_kind,
    grade: graded ? d.grade : null,
    uniqueSerial: card?.unique_serial ?? null,
    imageUrl: null,
  }

  return (
    <AppShell
      title={editing ? 'Edit card' : 'Add a card'}
      subtitle={editing ? d.player : 'The label updates as you type.'}
    >
      <Link
        to={editing ? `/vault/cards/${id}` : '/vault/cards'}
        className="mb-6 inline-block text-[0.86rem] text-secondary transition-colors hover:text-primary"
      >
        ← Back
      </Link>

      {editing && loading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)]">
          <div className="space-y-6">
            <Section title="Card">
              <Field label="Player">
                <TextInput value={d.player} onChange={(v) => set('player', v)} placeholder="Player name" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <Select value={d.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
                </Field>
                <Field label="Year">
                  <TextInput value={d.year} onChange={(v) => set('year', v)} placeholder="2024-2025" />
                </Field>
              </div>
              <Field label="Set" hint={knownSets.length ? 'Type a new set, or pick one you already own.' : undefined}>
                <TextInput
                  value={d.set_name}
                  onChange={(v) => set('set_name', v)}
                  placeholder="Topps Reverence"
                  list="known-sets"
                />
                <datalist id="known-sets">
                  {knownSets.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
              <Field label="Type">
                <Select value={d.auto_type} onChange={(v) => set('auto_type', v)} options={AUTO_TYPES} />
              </Field>
            </Section>

            <Section title="Serial and grade">
              <Field label="Serial">
                <Select value={d.serial_kind} onChange={(v) => set('serial_kind', v)} options={SERIAL_KINDS} />
              </Field>
              {d.serial_kind === 'Serial' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Number">
                    <TextInput
                      value={d.serial_num}
                      onChange={(v) => set('serial_num', v)}
                      inputMode="numeric"
                      placeholder="10"
                    />
                  </Field>
                  <Field label="Out of">
                    <TextInput
                      value={d.serial_total}
                      onChange={(v) => set('serial_total', v)}
                      inputMode="numeric"
                      placeholder="50"
                    />
                  </Field>
                </div>
              )}
              <Toggle label="Professionally graded" checked={graded} onChange={setGraded} />
              {graded && (
                <Field
                  label="Grade"
                  hint={d.grade ? gradeName(d.grade) : 'The grade replaces the designation on the label.'}
                >
                  <Select
                    value={d.grade}
                    onChange={(v) => set('grade', v)}
                    options={GRADES}
                    placeholder="Choose a grade"
                  />
                </Field>
              )}
            </Section>

            <Section title="Acquisition">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Source">
                  <Select value={d.source} onChange={(v) => set('source', v)} options={SOURCES} />
                </Field>
                <Field label="Bought from">
                  <TextInput value={d.seller} onChange={(v) => set('seller', v)} placeholder="Seller" />
                </Field>
                <Field label="Price paid">
                  <TextInput
                    value={d.price_paid}
                    onChange={(v) => set('price_paid', v)}
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Date acquired">
                  <TextInput
                    value={d.date_acquired}
                    onChange={(v) => set('date_acquired', v)}
                    type="date"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Value and status">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Comp value">
                  <TextInput
                    value={d.comp_value}
                    onChange={(v) => set('comp_value', v)}
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Status">
                  <Select value={d.status} onChange={(v) => set('status', v)} options={STATUSES} />
                </Field>
              </div>
              <Field label="Comp notes">
                <TextInput value={d.comp_notes} onChange={(v) => set('comp_notes', v)} />
              </Field>
              {d.status === 'Sold' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sold price">
                    <TextInput
                      value={d.sold_price}
                      onChange={(v) => set('sold_price', v)}
                      inputMode="decimal"
                    />
                  </Field>
                  <Field label="Sold date">
                    <TextInput value={d.sold_date} onChange={(v) => set('sold_date', v)} type="date" />
                  </Field>
                </div>
              )}
              <Field label="Notes">
                <TextArea value={d.notes} onChange={(v) => set('notes', v)} />
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
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add card'}
              </button>
              <Link
                to={editing ? `/vault/cards/${id}` : '/vault/cards'}
                className="text-[0.88rem] text-secondary transition-colors hover:text-primary"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <Slab card={preview} />
            <p className="mt-3 px-1 text-[0.76rem] text-tertiary">
              {editing
                ? 'Photos are added in the app.'
                : 'A Slabd serial and QR code are assigned when you save.'}
            </p>
          </div>
        </div>
      )}
    </AppShell>
  )
}
