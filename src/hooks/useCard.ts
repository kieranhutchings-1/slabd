import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Card } from '../lib/types'

/** A single card by id. RLS means a card belonging to someone else simply
 *  isn't found, rather than needing an ownership check here. */
export function useCard(id: string | undefined) {
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase.from('cards').select('*').eq('id', id).maybeSingle()
    if (error) setError(error.message)
    else setCard((data as Card) ?? null)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { card, loading, error, reload: load }
}
