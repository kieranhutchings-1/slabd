import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Snapshot {
  day: string
  card_count: number
  total_paid: number
  held_value: number
  realised: number
}

/** Daily history of what the collection is worth. Written nightly by a
 *  scheduled job in the database, so this is read-only from here. */
export function useSnapshots(days = 180) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)

    supabase
      .from('collection_snapshots')
      .select('day, card_count, total_paid, held_value, realised')
      .gte('day', since)
      .order('day')
      .then(({ data }) => {
        if (!live) return
        setSnapshots(
          (data ?? []).map((s) => ({
            ...s,
            total_paid: Number(s.total_paid),
            held_value: Number(s.held_value),
            realised: Number(s.realised),
          })) as Snapshot[],
        )
        setLoading(false)
      })

    return () => {
      live = false
    }
  }, [days])

  return { snapshots, loading }
}
