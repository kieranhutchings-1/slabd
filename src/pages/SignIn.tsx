import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Wordmark } from '../components/Chrome'

export function SignIn() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!loading && session) return <Navigate to="/vault" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)

    const { error } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) setError(error.message)
    // Sign-up doesn't create a session when email confirmation is on, so
    // say so rather than leaving the form sitting there looking broken.
    else if (mode === 'up') setNotice('Check your email to confirm the account, then sign in.')

    setBusy(false)
  }

  const field =
    'w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-primary placeholder:text-tertiary focus:border-brass/70 focus:outline-none'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_-10%,#1b2029_0%,var(--color-ink)_60%)] px-5 py-16">
      <Link to="/" className="mb-10">
        <Wordmark className="text-[1.05rem]" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-7">
        <h1 className="font-display mb-1.5 text-[1.4rem] font-bold text-primary">
          {mode === 'in' ? 'Open your vault' : 'Create an account'}
        </h1>
        <p className="mb-7 text-[0.86rem] leading-relaxed text-secondary">
          {mode === 'in'
            ? 'The same account you use in the app. Your collection is already here.'
            : 'Use this on the app too, it is one account for both.'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          <input
            type="password"
            required
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />

          {error && <p className="text-[0.84rem] text-loss">{error}</p>}
          {notice && <p className="text-[0.84rem] text-gain">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass py-3 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setError(null)
            setNotice(null)
          }}
          className="mt-5 w-full cursor-pointer text-[0.84rem] text-secondary transition-colors hover:text-primary"
        >
          {mode === 'in' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
