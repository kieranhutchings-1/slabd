import { Bullets, Clause, LegalPage } from '../components/Legal'

export function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="4 September 2026">
      <Clause heading="Agreeing to these terms">
        <p>
          By creating a SLABD account or using the app or website, you agree to these terms. If you
          don't agree with them, don't use the service. SLABD is operated from the United Kingdom.
        </p>
      </Clause>

      <Clause heading="Your account">
        <p>
          You need an account to keep a collection. Keep your password to yourself — you're
          responsible for what happens under your account. Tell us at{' '}
          <a href="mailto:hello@slabd.app" className="text-brass-bright">
            hello@slabd.app
          </a>{' '}
          if you think someone else has got into it. You must be at least 13 years old.
        </p>
      </Clause>

      <Clause heading="Your collection is yours">
        <p>
          You keep ownership of everything you put into SLABD — your card records, your photos, your
          notes. You grant us only the permission we need to run the service: to store your data, to
          show it back to you, and to display the limited card details described in the Privacy
          Policy on a card's public page when its QR code is scanned.
        </p>
        <p>
          You can export your whole collection as a spreadsheet at any time, and you can delete any
          card or ask us to close your account.
        </p>
      </Clause>

      <Clause heading="Valuations are estimates, not advice">
        <p>
          This one matters. Any value, comparable price, profit or loss figure that SLABD shows you
          is an estimate — often one you entered yourself, or one drawn from public listings. Card
          prices move constantly and listings are not sales.
        </p>
        <p>
          Nothing in SLABD is financial, investment, tax or insurance advice, and no figure it shows
          is a valuation, an appraisal or a guarantee that a card can be sold for that amount. If
          you need a number you can rely on — for insurance, a sale or a dispute — get a
          professional appraisal. Decisions you make using these figures are your own.
        </p>
      </Clause>

      <Clause heading="Grading, serials and the slab label">
        <p>
          The digital slab, its SLABD serial and its QR code are a presentation of the details you
          entered. A SLABD serial identifies a record in your collection. It is not a grading
          certificate, it does not authenticate a card, and it says nothing about whether a card is
          genuine or what condition it is in.
        </p>
        <p>
          Where you record a professional grade, that grade is one you have entered. It represents a
          third-party grader's opinion, not ours, and we don't verify it.
        </p>
      </Clause>

      <Clause heading="Not affiliated with card companies or graders">
        <p>
          SLABD is independent. Set names, manufacturer names, player names, team names and grading
          company names are the trademarks of their respective owners and are used only to describe
          the cards you own. SLABD is not affiliated with, endorsed by or sponsored by Topps, Panini,
          The Pokémon Company, WWE, PSA, BGS, CGC or any other card manufacturer, sports body or
          grading company.
        </p>
      </Clause>

      <Clause heading="Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            'Upload anything unlawful, or any photo you don\'t have the right to use.',
            'Use SLABD to misrepresent a card, or to help defraud a buyer.',
            'Try to access anyone else\'s collection, or probe, scrape or attack the service.',
            'Resell or redistribute the service, or use it to build a competing product.',
          ]}
        />
        <p>
          We may suspend or close an account that breaks these rules, and we'll tell you why where we
          reasonably can.
        </p>
      </Clause>

      <Clause heading="Availability">
        <p>
          SLABD is in active development and provided as it is, without any warranty that it will be
          uninterrupted, error-free, or that it will keep any particular feature. We may change,
          suspend or withdraw parts of the service. Where a change is significant and affects you, we
          will give reasonable notice.
        </p>
        <p>
          Keep your own copy of anything you can't afford to lose — the export tool is there for
          exactly that, and using it periodically is sensible.
        </p>
      </Clause>

      <Clause heading="Our liability">
        <p>
          Nothing in these terms limits our liability for death or personal injury caused by
          negligence, for fraud, or for anything else that can't be limited under UK law. Nothing
          here affects your statutory rights as a consumer.
        </p>
        <p>
          Beyond that, we are not liable for indirect or consequential loss, for lost profits, or for
          losses arising from a decision you made based on an estimated value shown in SLABD. Since
          the service is currently free to use, our total liability to you is limited to £100.
        </p>
      </Clause>

      <Clause heading="If we start charging">
        <p>
          SLABD is free today. If we introduce paid plans, we will set out the price and terms before
          you are asked to pay, and using the free service will never retroactively become chargeable.
        </p>
      </Clause>

      <Clause heading="Ending it">
        <p>
          You can stop using SLABD whenever you like and ask us to delete your account. We may close
          an account that breaks these terms, or discontinue the service entirely — in which case
          we'll give you reasonable notice and time to export your collection.
        </p>
      </Clause>

      <Clause heading="Changes and governing law">
        <p>
          We may update these terms; the date at the top shows when they last changed, and we'll
          email you before a material change takes effect. These terms are governed by the law of
          England and Wales, and the courts of England and Wales have jurisdiction — though if you
          live elsewhere in the UK you can bring proceedings in your own country.
        </p>
      </Clause>
    </LegalPage>
  )
}
