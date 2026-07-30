# Ovary

A one-page clinical brief for a PCOS appointment, built from a patient's cycle
history, labs, and prior treatments.

PCOS affects roughly 1 in 10 women. Standard care ends at diagnosis — generic
diet advice, and years of self-experimentation. Every cycle-tracking app fails
structurally because calendar math assumes ovulation, and irregular or absent
ovulation is the diagnostic criterion. Ovary doesn't predict a fertile window
it can't see — it infers a likely ovulation pattern from cycle length and says
so explicitly, then checks the patient's labs against the Rotterdam and
AE-PCOS criteria to surface what's missing (starting with fasting insulin and
HOMA-IR), and turns free-text history into the three questions that history
warrants.

**This is a frontend demo with mocked logic** — a fast way to see and iterate
on the full product flow before any real backend or LLM integration exists.

## What it does

1. **Intake** — cycle dates and lengths, symptoms, labs already on file,
   treatments tried, and free-text history in the patient's own words.
2. **Deterministic gap check** — a rule engine checks recorded labs against
   Rotterdam/AE-PCOS criteria. This part is rule-based and auditable; it
   cannot hallucinate.
3. **Clinical brief** — a printable one-pager: a quantified ovulation pattern
   ("likely anovulatory in 7 of your last 12 cycles"), a Rotterdam criteria
   snapshot, a clinical-language narrative, the three highest-yield questions,
   and the indicated tests missing from the file.

Every sentence in the narrative is checked against the patient-supplied data
it claims to come from (see `src/lib/narrativeGenerator.js`) — the brief
shows a "X/Y claims traced to patient input" badge. Nothing is invented.

## Running it locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone <this-repo-url>
cd pcos_app
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`) in your
browser. Click **Start your brief** on the landing page, then **Load example
patient** on the first intake step to see the full flow without typing in a
cycle history by hand.

## Project structure

```
src/
  components/     Landing, IntakeForm, Processing, ClinicalBrief + their CSS
  lib/
    ruleEngine.js          deterministic Rotterdam/AE-PCOS gap detection
    ovulationInference.js  cycle-length-based ovulation pattern inference
    narrativeGenerator.js  mocked "LLM" narrative step + traceability check
  data/
    mockPatients.js        example patient used by "Load example patient"
```

## What's mocked, and where a real backend would plug in

`generateClinicalNarrative()` in `src/lib/narrativeGenerator.js` currently
builds the narrative and questions from templated sentences — no network
call, no API key needed. The file documents the intended swap: a real LLM
call (e.g. the Claude API) would rephrase the patient's free text into
clinical language under a system prompt that requires citing a source field
per sentence, and the same `auditNarrativeClaims()` check would run against
its output before anything reaches the brief. The rule engine and ovulation
inference are already real, deterministic logic — no mocking there.

## What this is not

Ovary does not diagnose. It does not replace a clinician. The ovulation
pattern is inferred from cycle length alone, not measured via BBT, LH, or
serum progesterone — the brief says so on every page it appears.
