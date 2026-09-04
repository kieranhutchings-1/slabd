import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Footer, Nav } from './Chrome'

/** Shared shell for the policy pages: a readable measure, a last-updated
 *  line, and the same chrome as the rest of the site. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="font-display text-[2rem] font-bold text-primary">{title}</h1>
        <p className="mt-2 text-[0.82rem] text-tertiary">Last updated {updated}</p>
        <div className="mt-10 space-y-8">{children}</div>
        <p className="mt-14 border-t border-hairline pt-8 text-[0.84rem] text-secondary">
          Questions about this? Email{' '}
          <a
            href="mailto:hello@slabd.app"
            className="text-brass-bright transition-opacity hover:opacity-80"
          >
            hello@slabd.app
          </a>
          .
          <span className="px-2 text-tertiary">·</span>
          <Link to={title === 'Privacy Policy' ? '/terms' : '/privacy'} className="text-brass-bright transition-opacity hover:opacity-80">
            {title === 'Privacy Policy' ? 'Terms of Service' : 'Privacy Policy'}
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}

export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[1.15rem] font-bold text-primary">{heading}</h2>
      <div className="mt-3 space-y-3 text-[0.94rem] leading-relaxed text-secondary">{children}</div>
    </section>
  )
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-brass">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
