import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WantItem } from '../lib/wants'

export function useWants() {
  const [wants, setWants] = useState<WantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('wants').select('*')
    if (error) setError(error.message)
    else {
      setError(null)
      // numeric columns arrive as strings; every sum downstream would
      // concatenate instead of adding.
      setWants(
        ((data ?? []) as WantItem[]).map((w) => ({
          ...w,
          max_price: w.max_price == null ? null : Number(w.max_price),
          last_checked_price: w.last_checked_price == null ? null : Number(w.last_checked_price),
        })),
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { wants, loading, error, reload: load }
}
