import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Wordmark } from '../components/Chrome'

const MIN_LENGTH = 8

/** Where a password-reset email lands.
 *
 *  The link carries recovery tokens in the URL fragment, which supabase-js
 *  exchanges for a temporary session as soon as the page loads — so by the
 *  time this renders, `updateUser` is authorised to set a new password. The
 *  fragment never reaches the server, so this works even though the page is
 *  served through the static host's 404 fallback. */
export function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // The recovery session may not exist yet on first paint, so wait for the
    // event rather than reading the session once and giving up.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      // A link that's been used already, or has expired, leaves no session.
      else setTimeout(() => setInvalid((prev) => prev || !session), 2500)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Those two passwords don't match.")
      return
    }

    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    navigate('/vault', { replace: true })
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
          Choose a new password
        </h1>

        {ready ? (
          <>
            <p className="mb-7 text-[0.86rem] leading-relaxed text-secondary">
              This signs you in on this device once it's saved.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={field}
              />
              {error && <p className="text-[0.84rem] text-loss">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass py-3 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save password'}
              </button>
            </form>
          </>
        ) : invalid ? (
          <>
            <p className="mb-6 text-[0.86rem] leading-relaxed text-secondary">
              This link has expired or has already been used. Reset links are good for one use.
            </p>
            <Link
              to="/signin"
              className="block w-full cursor-pointer rounded-xl bg-gradient-to-b from-brass-bright to-brass py-3 text-center font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <div className="flex justify-center py-8">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
          </div>
        )}
      </div>
    </div>
  )
}
