// Deterministic clinical gap detection.
// Checks a patient's recorded labs against the Rotterdam criteria and the
// Androgen Excess & PCOS Society (AE-PCOS) metabolic work-up, and returns
// only what is present/absent in the data the patient supplied. No inference
// about diagnosis happens here — that judgment stays with the clinician.

export const INDICATED_TESTS = [
  {
    id: 'fastingInsulin',
    name: 'Fasting insulin',
    category: 'metabolic',
    priority: 1,
    indicatedWhen: () => true,
    reason:
      'Fasting insulin is the input HOMA-IR is calculated from. Without it, insulin resistance — present in most PCOS phenotypes — cannot be assessed even if glucose is normal.',
  },
  {
    id: 'homaIr',
    name: 'HOMA-IR',
    category: 'metabolic',
    priority: 1,
    indicatedWhen: () => true,
    reason:
      'A calculated index (fasting glucose x fasting insulin / 405), not a separate draw. Frequently never calculated even when both inputs already exist in the chart.',
  },
  {
    id: 'fastingGlucose',
    name: 'Fasting glucose or HbA1c',
    category: 'metabolic',
    priority: 2,
    indicatedWhen: () => true,
    reason:
      'Baseline glycemic status. PCOS carries elevated lifetime risk of impaired glucose tolerance and type 2 diabetes independent of BMI.',
  },
  {
    id: 'tsh',
    name: 'TSH (thyroid)',
    category: 'exclusion',
    priority: 2,
    indicatedWhen: () => true,
    reason:
      'Thyroid dysfunction is a Rotterdam-mandated exclusion — it can mimic oligo-ovulation on its own and must be ruled out before PCOS is confirmed.',
  },
  {
    id: 'prolactin',
    name: 'Prolactin',
    category: 'exclusion',
    priority: 2,
    indicatedWhen: () => true,
    reason:
      'Hyperprolactinemia is a second standard exclusion — it can independently cause irregular or absent cycles.',
  },
  {
    id: 'totalTestosterone',
    name: 'Total testosterone',
    category: 'androgen',
    priority: 1,
    indicatedWhen: (p) => hasAnyAndrogenSymptom(p),
    reason:
      'Reported androgenic symptoms (hirsutism, acne, scalp hair loss) warrant biochemical confirmation — the Rotterdam criteria accept clinical OR biochemical hyperandrogenism, but biochemical evidence changes what a clinician can act on.',
  },
  {
    id: 'freeTestosterone',
    name: 'Free testosterone or free androgen index',
    category: 'androgen',
    priority: 2,
    indicatedWhen: (p) => hasAnyAndrogenSymptom(p),
    reason:
      'Total testosterone can sit in range while free testosterone is elevated, especially when SHBG is low. Missing this is a common false-negative source.',
  },
  {
    id: 'shbg',
    name: 'SHBG',
    category: 'androgen',
    priority: 3,
    indicatedWhen: (p) => hasAnyAndrogenSymptom(p),
    reason: 'Needed to interpret total testosterone correctly and calculate free androgen index.',
  },
  {
    id: 'dheas',
    name: 'DHEA-S',
    category: 'androgen',
    priority: 3,
    indicatedWhen: (p) => hasAnyAndrogenSymptom(p),
    reason: 'Distinguishes ovarian vs. adrenal androgen source; also screens for adrenal etiologies.',
  },
  {
    id: 'seventeenOhProgesterone',
    name: '17-hydroxyprogesterone',
    category: 'exclusion',
    priority: 3,
    indicatedWhen: (p) => hasAnyAndrogenSymptom(p),
    reason:
      'Standard exclusion for non-classic congenital adrenal hyperplasia, which can present with a PCOS-like picture.',
  },
  {
    id: 'pelvicUltrasound',
    name: 'Pelvic (transvaginal) ultrasound',
    category: 'structural',
    priority: 2,
    indicatedWhen: () => true,
    reason:
      'The third Rotterdam criterion — polycystic ovarian morphology — cannot be assessed without imaging, and is often skipped when the other two criteria already appear to be met.',
  },
  {
    id: 'lipidPanel',
    name: 'Fasting lipid panel',
    category: 'metabolic',
    priority: 3,
    indicatedWhen: () => true,
    reason:
      'PCOS is associated with an atherogenic lipid profile independent of weight; standard in the metabolic work-up once a diagnosis is suspected.',
  },
]

function hasAnyAndrogenSymptom(patient) {
  const s = patient?.symptoms || {}
  return Boolean(s.hirsutism || s.acne || s.scalpHairLoss)
}

function isTestRecorded(patient, testId) {
  const labs = patient?.labsDone || {}
  return Boolean(labs[testId])
}

// Returns { missingTests, recordedTests, rotterdamStatus }
export function detectClinicalGaps(patient) {
  const missingTests = []
  const recordedTests = []

  for (const test of INDICATED_TESTS) {
    if (!test.indicatedWhen(patient)) continue
    if (isTestRecorded(patient, test.id)) {
      recordedTests.push(test)
    } else {
      missingTests.push(test)
    }
  }

  missingTests.sort((a, b) => a.priority - b.priority)

  const rotterdamStatus = {
    ovulatory: {
      criterion: 'Oligo- or anovulation',
      status: 'see ovulation pattern below',
      basis: 'inferred from reported cycle lengths, not measured directly (no BBT/LH/progesterone data supplied)',
    },
    hyperandrogenism: {
      criterion: 'Clinical or biochemical hyperandrogenism',
      status: hasAnyAndrogenSymptom(patient)
        ? isTestRecorded(patient, 'totalTestosterone') || isTestRecorded(patient, 'freeTestosterone')
          ? 'clinical symptoms reported, biochemical confirmation on file'
          : 'clinical symptoms reported, no biochemical confirmation on file'
        : 'no androgenic symptoms reported by patient',
      basis: 'patient-reported symptoms cross-checked against labs on file',
    },
    polycysticOvaries: {
      criterion: 'Polycystic ovarian morphology on ultrasound',
      status: isTestRecorded(patient, 'pelvicUltrasound') ? 'imaging on file' : 'no imaging on file',
      basis: 'presence/absence of a recorded pelvic ultrasound only — this tool does not read imaging results',
    },
  }

  return { missingTests, recordedTests, rotterdamStatus }
}
