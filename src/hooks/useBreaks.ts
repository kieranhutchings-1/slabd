import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Break, BreakSpot } from '../lib/breaks'

/** Breaks and their spots. Both are small tables — a spot per line item —
 *  so they're fetched whole rather than per break. */
export function useBreaks() {
  const [breaks, setBreaks] = useState<Break[]>([])
  const [spots, setSpots] = useState<BreakSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [b, s] = await Promise.all([
      supabase.from('breaks').select('*'),
      supabase.from('break_spots').select('*'),
    ])

    if (b.error || s.error) {
      setError(b.error?.message ?? s.error?.message ?? 'Unknown error')
    } else {
      setError(null)
      setBreaks((b.data ?? []) as Break[])
      // cost arrives as a numeric string from PostgREST, and every sum
      // downstream would silently concatenate instead of adding.
      setSpots(((s.data ?? []) as BreakSpot[]).map((x) => ({ ...x, cost: Number(x.cost) })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { breaks, spots, loading, error, reload: load }
}
