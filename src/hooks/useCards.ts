import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Card } from '../lib/types'

/** The signed-in user's cards. No user filter is needed in the query —
 *  row-level security scopes it server-side, the same way the iOS app
 *  relies on it. */
export function useCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('date_acquired', { ascending: false })
    if (error) setError(error.message)
    else {
      setError(null)
      setCards((data ?? []) as Card[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { cards, loading, error, reload: load }
}
