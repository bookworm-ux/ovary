// Mocked "narrative" step.
//
// In production this is where an LLM call turns colloquial, contradictory
// patient free text into clinical phrasing a gynaecologist can parse in
// seconds. That call is stubbed out below (see generateClinicalNarrative)
// so the UI and data flow can be built and demoed without an API key.
//
// The constraint that matters more than the wording: every sentence this
// function returns must be traceable to a field the patient actually
// supplied. Nothing here should be invented. buildClaims() below returns
// the narrative as a list of {text, sourceField} pairs specifically so that
// traceability can be checked mechanically (see auditNarrativeClaims) —
// the real eval, once a real LLM is wired in, is the fraction of sentences
// that fail that check.
//
// Swap point for a real model call:
//
//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
//     body: JSON.stringify({
//       model: 'claude-sonnet-5',
//       max_tokens: 600,
//       system: NARRATIVE_SYSTEM_PROMPT, // instructs: rephrase only, cite source field per sentence, refuse to add unsupplied claims
//       messages: [{ role: 'user', content: JSON.stringify({ patient, gapReport, ovulationReport }) }],
//     }),
//   })
//
// and then run the same auditNarrativeClaims() check on its output before
// it ever reaches the brief.

const SYMPTOM_LABELS = {
  hirsutism: 'hirsutism',
  acne: 'persistent acne',
  scalpHairLoss: 'scalp hair thinning',
  weightGain: 'weight gain resistant to diet/exercise',
  fatigue: 'fatigue',
  moodChanges: 'mood changes',
}

function listSymptoms(symptoms = {}) {
  return Object.entries(symptoms)
    .filter(([, present]) => present)
    .map(([key]) => SYMPTOM_LABELS[key] || key)
}

function buildClaims(patient, gapReport, ovulationReport) {
  const claims = []
  const { basics = {}, symptoms = {}, treatmentsTried = [] } = patient

  if (basics.age) {
    claims.push({
      text: `Patient is ${basics.age} years old${basics.yearsOfSymptoms ? `, reporting symptoms for approximately ${basics.yearsOfSymptoms} years` : ''}.`,
      sourceField: 'basics',
    })
  }

  if (ovulationReport?.totalCycles > 0) {
    claims.push({
      text: `Cycle history (${ovulationReport.totalCycles} cycles supplied): ${ovulationReport.summary}`,
      sourceField: 'cycles',
    })
  }

  const symptomList = listSymptoms(symptoms)
  if (symptomList.length > 0) {
    claims.push({
      text: `Patient reports ${symptomList.join(', ')}.`,
      sourceField: 'symptoms',
    })
  }

  if (treatmentsTried.length > 0) {
    const treatmentSentences = treatmentsTried.map((t) => {
      const duration = t.duration ? ` for ${t.duration}` : ''
      const outcome = t.outcome ? OUTCOME_PHRASING[t.outcome] || t.outcome : 'outcome not recorded'
      return `${t.name}${duration} (${outcome})`
    })
    claims.push({
      text: `Prior treatment attempts: ${treatmentSentences.join('; ')}.`,
      sourceField: 'treatmentsTried',
    })
  }

  if (gapReport?.recordedTests?.length > 0) {
    claims.push({
      text: `Labs already on file: ${gapReport.recordedTests.map((t) => t.name).join(', ')}.`,
      sourceField: 'labsDone',
    })
  }

  return claims
}

const OUTCOME_PHRASING = {
  helped: 'reported improvement',
  'no-change': 'no reported change',
  worsened: 'symptoms reportedly worsened',
  'stopped-side-effects': 'discontinued due to side effects',
}

function buildHighestYieldQuestions(patient, gapReport, ovulationReport) {
  const questions = []
  const symptomList = listSymptoms(patient.symptoms)
  const topMissing = gapReport?.missingTests?.slice(0, 3) || []
  const metabolicGap = topMissing.find((t) => t.category === 'metabolic')
  const androgenGap = topMissing.find((t) => t.category === 'androgen')
  const stoppedTreatment = (patient.treatmentsTried || []).find((t) => t.outcome === 'stopped-side-effects')
  const noChangeTreatment = (patient.treatmentsTried || []).find((t) => t.outcome === 'no-change')

  const mentionedTestIds = new Set()

  if (ovulationReport?.likelyAnovulatoryCount > 0 && metabolicGap) {
    questions.push({
      text: `Given a pattern consistent with anovulation in ${ovulationReport.likelyAnovulatoryCount} of the last ${ovulationReport.totalCycles} cycles, should ${metabolicGap.name.toLowerCase()} be ordered before the next treatment decision?`,
      sourceField: 'cycles + labsDone',
    })
    mentionedTestIds.add(metabolicGap.id)
  }

  if (androgenGap && symptomList.length > 0) {
    questions.push({
      text: `Reported ${symptomList.join(' and ')} without biochemical confirmation on file — should ${androgenGap.name.toLowerCase()} be drawn to confirm hyperandrogenism?`,
      sourceField: 'symptoms + labsDone',
    })
    mentionedTestIds.add(androgenGap.id)
  }

  if (stoppedTreatment) {
    questions.push({
      text: `${stoppedTreatment.name} was discontinued due to side effects — is an alternative formulation or insulin-sensitizing approach appropriate given the metabolic picture?`,
      sourceField: 'treatmentsTried',
    })
  } else if (noChangeTreatment) {
    questions.push({
      text: `${noChangeTreatment.name} produced no reported change — does that change the working diagnosis, or does dosing/duration need review?`,
      sourceField: 'treatmentsTried',
    })
  }

  if (questions.length < 3) {
    const remainingGap = topMissing.find((t) => !mentionedTestIds.has(t.id))
    if (remainingGap) {
      questions.push({
        text: `${remainingGap.name} is not on file — ${remainingGap.reason}`,
        sourceField: 'labsDone',
      })
    }
  }

  return questions.slice(0, 3)
}

// Mechanical traceability check: every claim must reference a source field
// that actually had data. This is the stand-in for the real eval once an
// LLM is generating free-form text instead of templated sentences.
export function auditNarrativeClaims(claims, patient) {
  return claims.map((claim) => {
    const fields = claim.sourceField.split('+').map((f) => f.trim())
    const traced = fields.every((f) => {
      const value = patient[f]
      if (Array.isArray(value)) return value.length > 0
      if (value && typeof value === 'object') return Object.values(value).some(Boolean)
      return Boolean(value)
    })
    return { ...claim, traced }
  })
}

export function generateClinicalNarrative(patient, gapReport, ovulationReport) {
  const rawClaims = buildClaims(patient, gapReport, ovulationReport)
  const auditedClaims = auditNarrativeClaims(rawClaims, patient)
  const highestYieldQuestions = buildHighestYieldQuestions(patient, gapReport, ovulationReport)

  const untracedCount = auditedClaims.filter((c) => !c.traced).length

  return {
    claims: auditedClaims,
    narrative: auditedClaims.map((c) => c.text).join(' '),
    highestYieldQuestions,
    traceability: {
      totalClaims: auditedClaims.length,
      untracedCount,
      passed: untracedCount === 0,
    },
  }
}
