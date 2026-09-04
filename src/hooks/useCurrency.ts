import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'
import {
  getCurrency,
  setCurrencyLocally,
  subscribeCurrency,
  type CurrencyCode,
} from '../lib/currency'

/** The user's chosen currency, kept in step with the database so the phone and
 *  the web agree. Subscribing re-renders on change, which is how the whole
 *  vault picks up a new symbol without every `money()` call site knowing. */
export function useCurrency() {
  const currency = useSyncExternalStore(subscribeCurrency, getCurrency, getCurrency)

  useEffect(() => {
    let live = true
    supabase
      .from('user_settings')
      .select('currency')
      .maybeSingle()
      .then(({ data }) => {
        if (!live || !data?.currency) return
        setCurrencyLocally(data.currency as CurrencyCode)
      })
    return () => {
      live = false
    }
  }, [])

  const change = useCallback(async (code: CurrencyCode): Promise<string | null> => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return 'Your session has expired. Sign in again.'

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: auth.user.id, currency: code }, { onConflict: 'user_id' })
    if (error) return error.message

    setCurrencyLocally(code)
    return null
  }, [])

  return { currency, change }
}
