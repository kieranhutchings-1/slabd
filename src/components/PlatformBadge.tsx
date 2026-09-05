/** Marks a feature that only exists in the iPhone app.
 *
 *  The web vault is a companion: it opens and edits the same collection, but
 *  capture, pricing and the insurance export need the phone. Only the
 *  exceptions carry a mark. A matching "web" badge on everything else would
 *  double the noise to say the same thing, so the legend under each list
 *  carries that half instead.
 *
 *  `decorative` is for the legend itself, where the badge is an example of a
 *  mark rather than a mark on anything, and so should not be read out as if
 *  it labelled the sentence around it. */
export function AppOnly({
  decorative = false,
  className = '',
}: {
  decorative?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden={decorative || undefined}
      className={`font-display inline-flex shrink-0 items-center rounded-full border border-brass/40 px-2 py-0.5 text-[0.62rem] leading-[1.5] tracking-[0.12em] text-brass-bright uppercase ${className}`}
    >
      iPhone
      {!decorative && <span className="sr-only"> app only</span>}
    </span>
  )
}
