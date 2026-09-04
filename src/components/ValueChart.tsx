import { useState } from 'react'
import type { Snapshot } from '../hooks/useSnapshots'
import { money } from '../lib/format'

const W = 720
const H = 240
const PAD = { top: 16, right: 16, bottom: 28, left: 64 }

/** Rounds a gridline step up to something a person would actually choose —
 *  50, 100, 250, 1000 — so the axis reads "£4,000" rather than "£4,560.28". */
function niceStep(rough: number) {
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10
  return step * magnitude
}

const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

/** Two lines on one shared axis: what the collection is worth, and what it
 *  cost. Both are money, so they belong on the same scale — the gap between
 *  them is the whole point, and it's only readable if they share an axis.
 *
 *  Value is the brass line and carries the emphasis; cost is deliberately
 *  recessive, because it's the reference the eye measures against rather
 *  than the subject. */
export function ValueChart({ data }: { data: Snapshot[] }) {
  const [hover, setHover] = useState<number | null>(null)

  // A baseline of zero keeps the gap between the two lines proportional to
  // the actual profit. Cropping to the data's own range would exaggerate
  // every wobble into a cliff.
  const max = Math.max(...data.map((d) => Math.max(d.held_value, d.total_paid)), 1)
  const step = niceStep((max * 1.1) / 4)
  const top = step * 4

  const x = (i: number) => PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH

  const path = (pick: (d: Snapshot) => number) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(pick(d)).toFixed(1)}`).join(' ')

  // Four gridlines is enough to read a value off; more is chartjunk.
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step)
  const active = hover != null ? data[hover] : null
  const last = data[data.length - 1]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem]">
        <span className="flex items-center gap-2 text-secondary">
          <span className="h-0.5 w-4 rounded-full bg-brass-bright" />
          Worth {money(last.held_value)}
        </span>
        <span className="flex items-center gap-2 text-tertiary">
          <span className="h-0.5 w-4 rounded-full bg-[var(--color-secondary)]" />
          Paid {money(last.total_paid)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label={`Collection value over time. Currently worth ${money(last.held_value)} against ${money(last.total_paid)} paid.`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect()
            const px = ((e.clientX - box.left) / box.width) * W
            const i = Math.round(((px - PAD.left) / plotW) * (data.length - 1))
            setHover(Math.max(0, Math.min(data.length - 1, i)))
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-hairline)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                className="figures"
                fill="var(--color-tertiary)"
                fontSize="10"
              >
                {money(t).replace(/\.00$/, '')}
              </text>
            </g>
          ))}

          <path
            d={path((d) => d.total_paid)}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={path((d) => d.held_value)}
            fill="none"
            stroke="var(--color-brass-bright)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* One point each end rather than a dot on every day, so the line
              stays a line. A single-day collection gets its dot too. */}
          {(data.length === 1 ? [0] : [data.length - 1]).map((i) => (
            <circle key={i} cx={x(i)} cy={y(data[i].held_value)} r="4" fill="var(--color-brass-bright)" />
          ))}

          {hover != null && (
            <g>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="var(--color-brass)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={x(hover)}
                cy={y(data[hover].held_value)}
                r="4.5"
                fill="var(--color-brass-bright)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            </g>
          )}

          <text
            x={PAD.left}
            y={H - 8}
            fill="var(--color-tertiary)"
            fontSize="10"
            className="figures"
          >
            {shortDate(data[0].day)}
          </text>
          <text
            x={W - PAD.right}
            y={H - 8}
            textAnchor="end"
            fill="var(--color-tertiary)"
            fontSize="10"
            className="figures"
          >
            {shortDate(last.day)}
          </text>
        </svg>
      </div>

      <p className="mt-2 min-h-[1.2rem] text-[0.8rem] text-secondary">
        {active ? (
          <>
            <span className="text-primary">{shortDate(active.day)}</span>
            <span className="px-2 text-tertiary">·</span>
            worth <span className="figures text-primary">{money(active.held_value)}</span>
            <span className="px-2 text-tertiary">·</span>
            paid <span className="figures text-primary">{money(active.total_paid)}</span>
            <span className="px-2 text-tertiary">·</span>
            <span className="figures">{active.card_count} cards</span>
          </>
        ) : (
          <span className="text-tertiary">Hover the chart to read a day.</span>
        )}
      </p>
    </div>
  )
}
