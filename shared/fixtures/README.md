# Shared rules

Four rules in SLABD are implemented twice: once in Swift for the iPhone app,
once in TypeScript for the web vault. Both write to the same Supabase tables,
so if the two implementations disagree, one of them silently writes data the
other reads back wrong. Nothing about that is visible on screen. A date lands
in the wrong month, a break allocation is a penny out, a profit figure flips
sign, and the app looks fine.

These files are the contract. Each is a list of `{ input, expect }` cases that
**both** codebases run as tests. If one side changes a rule, the fixture has to
change too, and the other side's tests go red until it agrees. That is the whole
point: the rules stop being held in two people's heads and two sets of comments.

## The files

| File | Rule | TypeScript | Swift |
| --- | --- | --- | --- |
| `dates.json` | Normalising spreadsheet-mangled dates on CSV import | `normalizeDate` in `src/lib/csv.ts` | the importer's date guard |
| `per-hit-cost.json` | Splitting a break spot's cost across its hits | `perHitCost` in `src/lib/breaks.ts` | the break allocation |
| `profit-loss.json` | Profit or loss on a single card | `profitLoss` in `src/lib/format.ts` | `Card.profitLoss` |
| `csv-columns.json` | Column order and names for CSV export and import | `CSV_COLUMNS` in `src/lib/csv.ts` | `Card.csvColumns` |

## Using them from the iOS side

Add this directory to the iOS repo (copy it, or reference this repo as a
submodule so there is only ever one copy), then decode each file in a unit test
and assert the Swift implementation returns `expect` for every `input`. The
shapes are deliberately plain: strings, numbers and nulls, no nesting beyond one
object per case, so `Codable` handles them with no custom decoding.

## Two things to watch

**Rounding.** `per-hit-cost.json` includes a case that lands exactly on a half
penny (`0.05` across 2 hits). JavaScript's `Math.round` and Swift's `rounded()`
both round half away from zero, so both give `0.03`. Banker's rounding would
give `0.02`. If either side ever switches to a rounding mode that breaks ties
differently, that case is what catches it.

**Ambiguous dates.** `dates.json` fixes day-first as the winner when a date
could be read either way, so `03/04/2026` is 3 April and never 4 March. That is
a choice, not a fact. It matches how a UK spreadsheet writes dates, and both
sides have to make the same choice or the same file imports differently
depending which app opened it.
