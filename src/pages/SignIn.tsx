import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Wordmark } from '../components/Chrome'

export function SignIn() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<'in' | 'up' | 'forgot'>('in')
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

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`,
      })
      if (error) setError(error.message)
      // Deliberately the same message whether or not that address has an
      // account: saying "no such account" would let anyone test which email
      // addresses are registered here.
      else setNotice('If that address has an account, a reset link is on its way.')
      setBusy(false)
      return
    }

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

  const heading =
    mode === 'in' ? 'Open your vault' : mode === 'up' ? 'Create an account' : 'Reset your password'

  const blurb =
    mode === 'in'
      ? 'The same account you use in the app. Your collection is already here.'
      : mode === 'up'
        ? 'Use this on the app too, it is one account for both.'
        : 'Enter your email and we will send you a link to set a new one.'

  const field =
    'w-full rounded-xl border border-hairline bg-ink px-4 py-3 text-primary placeholder:text-tertiary focus:border-brass/70 focus:outline-none'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_-10%,#1b2029_0%,var(--color-ink)_60%)] px-5 py-16">
      <Link to="/" className="mb-10">
        <Wordmark className="text-[1.05rem]" />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-7">
        <h1 className="font-display mb-1.5 text-[1.4rem] font-bold text-primary">{heading}</h1>
        <p className="mb-7 text-[0.86rem] leading-relaxed text-secondary">{blurb}</p>

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
          {mode !== 'forgot' && (
            <input
              type="password"
              required
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          )}

          {error && <p className="text-[0.84rem] text-loss">{error}</p>}
          {notice && <p className="text-[0.84rem] text-gain">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass py-3 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? 'One moment…'
              : mode === 'in'
                ? 'Sign in'
                : mode === 'up'
                  ? 'Create account'
                  : 'Send reset link'}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center">
          <button
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in')
              setError(null)
              setNotice(null)
            }}
            className="w-full cursor-pointer text-[0.84rem] text-secondary transition-colors hover:text-primary"
          >
            {mode === 'in' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
          </button>
          {mode !== 'forgot' && (
            <button
              onClick={() => {
                setMode('forgot')
                setError(null)
                setNotice(null)
              }}
              className="w-full cursor-pointer text-[0.84rem] text-tertiary transition-colors hover:text-primary"
            >
              Forgotten your password?
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-[0.76rem] text-tertiary">
        <Link to="/privacy" className="transition-colors hover:text-secondary">
          Privacy
        </Link>
        <span className="px-2">·</span>
        <Link to="/terms" className="transition-colors hover:text-secondary">
          Terms
        </Link>
      </p>
    </div>
  )
}
