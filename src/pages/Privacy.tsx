import { Link } from 'react-router-dom'
import { Bullets, Clause, LegalPage } from '../components/Legal'

/** Written to describe what SLABD actually does today, not a generic
 *  template. If the product starts collecting something new — analytics,
 *  payments, a public feed that opts cards in by default — this page has to
 *  change in the same commit. */
export function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="4 September 2026">
      <Clause heading="The short version">
        <p>
          SLABD stores the collection you enter and the email address you sign in with. We don't
          sell your data, we don't run advertising, and we don't use tracking or analytics cookies.
          Your collection is private to your account unless you deliberately share a card.
        </p>
      </Clause>

      <Clause heading="Who we are">
        <p>
          SLABD is a trading card collection app and website operated from the United Kingdom. For
          UK GDPR purposes we are the data controller for the information described here. Contact us
          at <a href="mailto:hello@slabd.app" className="text-brass-bright">hello@slabd.app</a>.
        </p>
      </Clause>

      <Clause heading="What we collect">
        <Bullets
          items={[
            <>
              <strong className="text-primary">Your account.</strong> Your email address and a
              securely hashed password. We never see your password in readable form.
            </>,
            <>
              <strong className="text-primary">Your collection.</strong> Everything you enter about
              a card — player, year, set, type, serial, grade, what you paid, who you bought it
              from, its estimated value, sale details and your own notes.
            </>,
            <>
              <strong className="text-primary">Photos.</strong> Any card photos you take or upload.
              These are resized and stored in our hosting provider's file storage.
            </>,
            <>
              <strong className="text-primary">Technical information.</strong> Our hosting providers
              keep standard server logs, which include IP addresses, for security and
              troubleshooting.
            </>,
          ]}
        />
        <p>
          We do not ask for your name, address, phone number or payment details, and the app has no
          advertising or analytics SDK in it.
        </p>
      </Clause>

      <Clause heading="Why we're allowed to hold it">
        <p>
          We process your account details and your collection to provide the service you asked for —
          in legal terms, performance of our contract with you. We keep server logs on the basis of
          our legitimate interest in keeping the service secure and working.
        </p>
      </Clause>

      <Clause heading="Sharing a card publicly">
        <p>
          Every card is given a SLABD serial and a QR code. Scanning that code, or opening the link
          it points to, shows a public page for that one card: the player, year, set, type, serial,
          grade and its photo. It does not show what you paid, what you think it's worth, who you
          bought it from, your notes, your email address or anything else in your collection.
        </p>
        <p>
          Anyone holding the card, or a photo of its label, can view that page. That is the point of
          the QR code — but it means you should treat the label as public. If you don't want a card
          to be viewable this way, don't share its label or code.
        </p>
      </Clause>

      <Clause heading="Who else handles your data">
        <p>We keep this list short on purpose. Our processors are:</p>
        <Bullets
          items={[
            <>
              <strong className="text-primary">Supabase</strong> — database, sign-in and photo
              storage. Your collection lives here.
            </>,
            <>
              <strong className="text-primary">GitHub Pages</strong> — serves this website.
            </>,
            <>
              <strong className="text-primary">Google Fonts</strong> — the site loads two typefaces
              from Google's servers, so Google receives your IP address when a page loads. Nothing
              about your collection is sent.
            </>,
            <>
              <strong className="text-primary">Apple</strong> — if you use the iPhone app, Apple
              handles its distribution.
            </>,
          ]}
        />
        <p>
          Some of these providers operate servers outside the UK. Where data is transferred abroad,
          it is protected by the standard contractual terms those providers offer.
        </p>
      </Clause>

      <Clause heading="Cookies and local storage">
        <p>
          We use no advertising or analytics cookies, so there's no cookie banner to click through.
          The site stores a sign-in token in your browser so you stay signed in, and remembers small
          preferences such as your chosen sort order. Both stay on your device. Clearing your browser
          data removes them and signs you out.
        </p>
      </Clause>

      <Clause heading="How long we keep it">
        <p>
          Your collection stays until you delete it or close your account. Deleting a card removes
          it and its photo. If you ask us to close your account we delete your data within 30 days,
          apart from anything we're legally required to retain. Server logs are kept for a short
          period by our providers as part of their normal operation.
        </p>
      </Clause>

      <Clause heading="Your rights">
        <p>
          Under UK GDPR you can ask for a copy of your data, correct it, delete it, restrict or
          object to how we use it, or ask for it in a portable format. Two of those you can do
          yourself right now: the vault's{' '}
          <Link to="/vault/data" className="text-brass-bright">
            import and export
          </Link>{' '}
          page downloads your whole collection as a spreadsheet, and any card can be deleted from
          the app or the website.
        </p>
        <p>
          For anything else, email{' '}
          <a href="mailto:hello@slabd.app" className="text-brass-bright">
            hello@slabd.app
          </a>{' '}
          and we'll respond within one month. If you think we've handled your data badly you can
          complain to the Information Commissioner's Office at ico.org.uk.
        </p>
      </Clause>

      <Clause heading="Children">
        <p>
          SLABD isn't intended for children under 13, and we don't knowingly collect their data. If
          you believe a child has created an account, email us and we'll remove it.
        </p>
      </Clause>

      <Clause heading="Changes">
        <p>
          If we change this policy we'll update the date at the top, and we'll tell you by email
          before anything that materially affects how your data is used takes effect.
        </p>
      </Clause>
    </LegalPage>
  )
}
