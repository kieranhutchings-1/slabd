import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

/** Session state for the same Supabase project the iOS app signs into, so a
 *  web login is literally the same account. `loading` matters: without it
 *  the app flashes the signed-out UI for a moment on every refresh while
 *  the stored session is being restored. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading, user: session?.user ?? null }
}
