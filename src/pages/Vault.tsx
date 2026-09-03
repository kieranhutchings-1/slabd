import { Navigate } from 'react-router-dom'
import { Nav } from '../components/Chrome'
import { useAuth } from '../hooks/useAuth'

/** Placeholder for the signed-in experience. Auth and data access are
 *  already wired; the collection, card detail and insights screens land
 *  here next. */
export function Vault() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-brass-bright" />
      </div>
    )
  }
  if (!session) return <Navigate to="/signin" replace />

  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-[1.8rem] font-bold text-primary">Your vault</h1>
        <p className="mt-3 text-[0.95rem] text-secondary">
          Signed in as {session.user.email}.
        </p>
        <p className="mt-6 text-[0.9rem] leading-relaxed text-tertiary">
          The collection, card detail and insights screens are next. Everything behind this point
          reads the same database as the app, so whatever you add on your phone shows up here.
        </p>
      </div>
    </div>
  )
}
