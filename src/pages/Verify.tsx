import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Slab } from '../components/Slab'
import { Wordmark } from '../components/Chrome'
import { FUNCTIONS_BASE } from '../lib/supabase'
import type { PublicCard } from '../lib/types'

/** The page a scanned QR code lands on. Public and unauthenticated: the
 *  `card-data` function returns only fields that are safe to show, so
 *  nothing here can leak what a card cost or what else is owned. */
export function Verify({ serial }: { serial: string }) {
  const [card, setCard] = useState<PublicCard | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading')

  useEffect(() => {
    if (!/^\d{10}$/.test(serial)) {
      setState('missing')
      return
    }
    let live = true
    fetch(`${FUNCTIONS_BASE}/card-data/${serial}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((data: PublicCard) => {
        if (!live) return
        setCard(data)
        setState('ok')
      })
      .catch(() => live && setState('missing'))
    return () => {
      live = false
    }
  }, [serial])

  return (
    <div className="flex min-h-screen flex-col items-center bg-[radial-gradient(circle_at_50%_-10%,#1b2029_0%,var(--color-ink)_60%)] px-5 py-8">
      <Link to="/" className="mb-7">
        <Wordmark className="text-[0.95rem]" />
      </Link>

      {state === 'loading' && (
        <div className="mt-24 flex flex-col items-center gap-4 text-[0.9rem] text-secondary">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
          Looking up this card…
        </div>
      )}

      {state === 'missing' && (
        <div className="mt-24 max-w-sm text-center text-[0.9rem] leading-relaxed text-secondary">
          This card could not be verified. The link may be out of date, or the card may have been
          removed from its owner's vault.
        </div>
      )}

      {state === 'ok' && card && (
        <div className="w-full max-w-[420px]">
          <Slab
            card={{
              player: card.player,
              year: card.year,
              setName: card.setName,
              autoType: card.autoType,
              serialNum: card.serialNum,
              serialTotal: card.serialTotal,
              serialKind: card.serialKind,
              grade: card.grade,
              uniqueSerial: card.uniqueSerial,
              imageUrl: card.imageUrl,
            }}
          />

          <div className="mt-4 flex items-center justify-between px-1 text-[0.72rem] text-tertiary">
            <span className="figures font-mono">Slabd serial {card.uniqueSerial}</span>
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-gain shadow-[0_0_6px_var(--color-gain)]" />
              Verified card
            </span>
          </div>

          <div className="mt-10 text-center">
            <p className="mb-4 text-[0.86rem] leading-relaxed text-secondary">
              This page confirms the card above is catalogued in its owner's Slabd vault.
            </p>
            <Link
              to="/"
              className="inline-block rounded-full bg-gradient-to-b from-brass-bright to-brass px-7 py-3 font-semibold text-ink transition-opacity hover:opacity-90"
            >
              What is Slabd?
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
