import { useState } from 'react'
import { Field, TextArea, TextInput } from './Field'
import { supabase } from '../lib/supabase'

type Kind = 'bug' | 'feature'

const MAX_TITLE = 200
const MAX_BODY = 5000

/** Report a bug or ask for a feature, from inside the app.
 *
 *  Writes a row rather than opening a mail client: an email arrives with no
 *  version or platform attached, needs an inbox watched by hand, and gives the
 *  person no sign their report went anywhere. */
export function FeedbackForm() {
  const [kind, setKind] = useState<Kind>('bug')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function submit() {
    if (!title.trim()) {
      setError('Give it a one-line summary.')
      return
    }
    if (!body.trim()) {
      setError(kind === 'bug' ? 'Describe what happened.' : 'Describe what you would like.')
      return
    }

    setBusy(true)
    setError(null)

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      setError('Your session has expired. Sign in again.')
      setBusy(false)
      return
    }

    const { error } = await supabase.from('feedback').insert({
      user_id: auth.user.id,
      kind,
      title: title.trim().slice(0, MAX_TITLE),
      body: body.trim().slice(0, MAX_BODY),
      platform: 'web',
      // The browser, since a web bug is usually browser-specific. Truncated:
      // a modern user agent string is long and mostly noise.
      app_version: navigator.userAgent.slice(0, 120),
    })

    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
    setTitle('')
    setBody('')
  }

  if (sent) {
    return (
      <div>
        <p className="text-[0.92rem] text-primary">Thanks — that's logged.</p>
        <p className="mt-1 text-[0.86rem] text-secondary">
          Every report gets read. You won't get an automatic reply, but if it needs a question
          answering we'll email you.
        </p>
        <button
          onClick={() => {
            setSent(false)
            setError(null)
          }}
          className="mt-4 cursor-pointer text-[0.88rem] text-brass-bright transition-opacity hover:opacity-80"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex gap-2">
        {(['bug', 'feature'] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setKind(k)
              setError(null)
            }}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[0.84rem] transition-colors ${
              kind === k
                ? 'bg-gradient-to-b from-brass-bright to-brass font-medium text-ink'
                : 'border border-hairline text-secondary hover:text-primary'
            }`}
          >
            {k === 'bug' ? 'Something is broken' : 'I have an idea'}
          </button>
        ))}
      </div>

      <Field label={kind === 'bug' ? 'What went wrong' : 'What would you like'}>
        <TextInput
          value={title}
          onChange={setTitle}
          maxLength={MAX_TITLE}
          placeholder={
            kind === 'bug'
              ? 'Photos do not upload on the card form'
              : 'Let me record a card parallel'
          }
        />
      </Field>

      <Field
        label={kind === 'bug' ? 'What you did, and what happened' : 'Why it would help'}
        hint={
          kind === 'bug'
            ? 'The steps you took matter more than anything — they are what makes it fixable.'
            : undefined
        }
      >
        <TextArea value={body} onChange={setBody} rows={5} />
      </Field>

      {error && <p className="text-[0.84rem] text-loss">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          onClick={submit}
          disabled={busy}
          className="cursor-pointer rounded-full bg-gradient-to-b from-brass-bright to-brass px-5 py-2.5 text-[0.88rem] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send it'}
        </button>
        <span className="text-[0.78rem] text-tertiary">
          Your browser and version are attached automatically.
        </span>
      </div>
    </div>
  )
}
