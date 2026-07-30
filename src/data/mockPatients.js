// Example patient used for the "load example" demo shortcut. Lets a judge
// or a first-time user see the full flow without typing a cycle history in.

export const EXAMPLE_PATIENT = {
  basics: { age: '27', yearsOfSymptoms: '4' },
  cycles: [
    { id: 'c1', startDate: '2026-01-03', length: 29 },
    { id: 'c2', startDate: '2025-11-20', length: 44 },
    { id: 'c3', startDate: '2025-09-14', length: 67 },
    { id: 'c4', startDate: '2025-07-30', length: 45 },
    { id: 'c5', startDate: '2025-06-05', length: 55 },
    { id: 'c6', startDate: '2025-04-10', length: 56 },
    { id: 'c7', startDate: '2025-02-08', length: 61 },
    { id: 'c8', startDate: '2024-12-01', length: 69 },
    { id: 'c9', startDate: '2024-09-24', length: 68 },
    { id: 'c10', startDate: '2024-07-20', length: 66 },
    { id: 'c11', startDate: '2024-05-15', length: 66 },
    { id: 'c12', startDate: '2024-03-11', length: 65 },
  ],
  symptoms: {
    hirsutism: true,
    acne: true,
    scalpHairLoss: false,
    weightGain: true,
    fatigue: true,
    moodChanges: false,
  },
  labsDone: {
    fastingInsulin: false,
    homaIr: false,
    fastingGlucose: true,
    tsh: true,
    prolactin: false,
    totalTestosterone: true,
    freeTestosterone: false,
    shbg: false,
    dheas: false,
    seventeenOhProgesterone: false,
    pelvicUltrasound: true,
    lipidPanel: false,
  },
  treatmentsTried: [
    { id: 't1', name: 'Combined oral contraceptive', duration: '18 months', outcome: 'helped' },
    { id: 't2', name: 'Metformin 500mg', duration: '6 weeks', outcome: 'stopped-side-effects' },
    { id: 't3', name: 'Spearmint tea / inositol (self-directed)', duration: '3 months', outcome: 'no-change' },
  ],
  freeTextHistory:
    "Periods have basically never been regular since they started, but the last two years it's gotten a lot worse — sometimes 60+ days between them. Bled twice in three months earlier this year, then nothing for 60 days. Doctor put me on the pill at 22 which helped a lot but I came off it last year because we're trying to figure out what's actually going on. Tried metformin for six weeks but the GI side effects were too much and I stopped without really discussing alternatives with anyone.",
}

export const EMPTY_PATIENT = {
  basics: { age: '', yearsOfSymptoms: '' },
  cycles: [],
  symptoms: {
    hirsutism: false,
    acne: false,
    scalpHairLoss: false,
    weightGain: false,
    fatigue: false,
    moodChanges: false,
  },
  labsDone: {
    fastingInsulin: false,
    homaIr: false,
    fastingGlucose: false,
    tsh: false,
    prolactin: false,
    totalTestosterone: false,
    freeTestosterone: false,
    shbg: false,
    dheas: false,
    seventeenOhProgesterone: false,
    pelvicUltrasound: false,
    lipidPanel: false,
  },
  treatmentsTried: [],
  freeTextHistory: '',
}
