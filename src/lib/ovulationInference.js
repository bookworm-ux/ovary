// Ovulation pattern inference from cycle length alone.
//
// This is explicitly an inference, not a measurement: without basal body
// temperature, LH strips, or serum progesterone, ovulation cannot be
// confirmed cycle-by-cycle. What cycle length CAN do is flag cycles that are
// statistically unlikely to have been ovulatory. Every classification below
// carries that caveat forward into the output — the brief must say "likely"
// or "indeterminate," never "was."
//
// Thresholds (adult, post-menarche):
//   < 21 days or > 35 days  -> likely anovulatory (outside the range in which
//                               a luteal phase of normal length fits)
//   no bleed within 90 days -> amenorrhea, treated as likely anovulatory
//   21-35 days              -> likely ovulatory, UNLESS cycle-to-cycle length
//                               varies by more than 8 days from the previous
//                               cycle, which is itself a marker of irregularity
//                               -> classified as indeterminate rather than
//                               forced into either bucket

const SHORT_CYCLE_THRESHOLD = 21
const LONG_CYCLE_THRESHOLD = 35
const AMENORRHEA_THRESHOLD = 90
const VARIABILITY_THRESHOLD = 8

function classifyCycle(cycle, previousCycle) {
  if (cycle.length == null || cycle.length >= AMENORRHEA_THRESHOLD) {
    return { ...cycle, classification: 'likely-anovulatory', note: 'no bleed within 90 days' }
  }
  if (cycle.length < SHORT_CYCLE_THRESHOLD) {
    return { ...cycle, classification: 'likely-anovulatory', note: 'cycle shorter than 21 days' }
  }
  if (cycle.length > LONG_CYCLE_THRESHOLD) {
    return { ...cycle, classification: 'likely-anovulatory', note: 'cycle longer than 35 days' }
  }
  if (previousCycle?.length != null) {
    const delta = Math.abs(cycle.length - previousCycle.length)
    if (delta > VARIABILITY_THRESHOLD) {
      return {
        ...cycle,
        classification: 'indeterminate',
        note: `length varied ${delta} days from the prior cycle`,
      }
    }
  }
  return { ...cycle, classification: 'likely-ovulatory', note: 'within typical range and consistent length' }
}

export function inferOvulationPattern(cycles) {
  if (!cycles || cycles.length === 0) {
    return {
      classifiedCycles: [],
      totalCycles: 0,
      likelyAnovulatoryCount: 0,
      indeterminateCount: 0,
      summary: 'No cycle history supplied — ovulation pattern cannot be inferred.',
    }
  }

  const sorted = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  const classified = sorted.map((cycle, i) => classifyCycle(cycle, sorted[i - 1]))

  const likelyAnovulatoryCount = classified.filter((c) => c.classification === 'likely-anovulatory').length
  const indeterminateCount = classified.filter((c) => c.classification === 'indeterminate').length
  const totalCycles = classified.length

  const summary =
    likelyAnovulatoryCount === 0
      ? `No cycles in the last ${totalCycles} meet the length/variability pattern associated with anovulation.`
      : `Likely anovulatory in ${likelyAnovulatoryCount} of your last ${totalCycles} cycles, based on cycle length alone.`

  return {
    classifiedCycles: classified.reverse(), // most recent first for display
    totalCycles,
    likelyAnovulatoryCount,
    indeterminateCount,
    summary,
  }
}
