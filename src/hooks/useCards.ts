import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Card } from '../lib/types'

/** The signed-in user's cards. No user filter is needed in the query —
 *  row-level security scopes it server-side, the same way the iOS app
 *  relies on it. */
export function useCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    supabase
      .from('cards')
      .select('*')
      .order('date_acquired', { ascending: false })
      .then(({ data, error }) => {
        if (!live) return
        if (error) setError(error.message)
        else setCards((data ?? []) as Card[])
        setLoading(false)
      })
    return () => {
      live = false
    }
  }, [])

  return { cards, loading, error }
}
