import { AppShell } from '../components/AppShell'

/** Placeholder for nav destinations that exist in the app but not yet on the
 *  web, so the sidebar doesn't lead anywhere broken. */
export function Soon({ title, feature }: { title: string; feature: string }) {
  return (
    <AppShell title={title}>
      <p className="max-w-lg text-[0.92rem] leading-relaxed text-secondary">
        {feature} lives in the app for now. It reads the same database, so anything you record on
        your phone will appear here once this screen is built.
      </p>
    </AppShell>
  )
}
