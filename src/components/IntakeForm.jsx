import { useState } from 'react'
import { EXAMPLE_PATIENT, EMPTY_PATIENT } from '../data/mockPatients'
import { INDICATED_TESTS } from '../lib/ruleEngine'
import './IntakeForm.css'

const STEPS = ['Basics', 'Cycle history', 'Symptoms', 'Labs on file', 'Treatments tried', 'Your history']

const SYMPTOM_OPTIONS = [
  { id: 'hirsutism', label: 'Hirsutism (excess facial/body hair)' },
  { id: 'acne', label: 'Persistent acne' },
  { id: 'scalpHairLoss', label: 'Scalp hair thinning' },
  { id: 'weightGain', label: 'Weight gain resistant to diet/exercise' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'moodChanges', label: 'Mood changes' },
]

const OUTCOME_OPTIONS = [
  { value: '', label: 'Select outcome…' },
  { value: 'helped', label: 'Helped' },
  { value: 'no-change', label: 'No change' },
  { value: 'worsened', label: 'Symptoms worsened' },
  { value: 'stopped-side-effects', label: 'Stopped due to side effects' },
]

let idCounter = 0
function nextId(prefix) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export default function IntakeForm({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [patient, setPatient] = useState(EMPTY_PATIENT)

  const loadExample = () => setPatient(EXAMPLE_PATIENT)

  const updateBasics = (field, value) =>
    setPatient((p) => ({ ...p, basics: { ...p.basics, [field]: value } }))

  const updateSymptom = (id, value) =>
    setPatient((p) => ({ ...p, symptoms: { ...p.symptoms, [id]: value } }))

  const updateLab = (id, value) =>
    setPatient((p) => ({ ...p, labsDone: { ...p.labsDone, [id]: value } }))

  const addCycle = () =>
    setPatient((p) => ({
      ...p,
      cycles: [...p.cycles, { id: nextId('cycle'), startDate: '', length: '' }],
    }))

  const updateCycle = (id, field, value) =>
    setPatient((p) => ({
      ...p,
      cycles: p.cycles.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }))

  const removeCycle = (id) =>
    setPatient((p) => ({ ...p, cycles: p.cycles.filter((c) => c.id !== id) }))

  const addTreatment = () =>
    setPatient((p) => ({
      ...p,
      treatmentsTried: [...p.treatmentsTried, { id: nextId('treatment'), name: '', duration: '', outcome: '' }],
    }))

  const updateTreatment = (id, field, value) =>
    setPatient((p) => ({
      ...p,
      treatmentsTried: p.treatmentsTried.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }))

  const removeTreatment = (id) =>
    setPatient((p) => ({ ...p, treatmentsTried: p.treatmentsTried.filter((t) => t.id !== id) }))

  const isLastStep = step === STEPS.length - 1
  const canGoNext = step !== 1 || patient.cycles.length > 0

  const goNext = () => {
    if (isLastStep) {
      const normalized = {
        ...patient,
        cycles: patient.cycles
          .filter((c) => c.startDate && c.length !== '')
          .map((c) => ({ ...c, length: Number(c.length) })),
      }
      onComplete(normalized)
    } else {
      setStep((s) => s + 1)
    }
  }

  const goPrev = () => {
    if (step === 0) onBack()
    else setStep((s) => s - 1)
  }

  return (
    <div className="intake">
      <div className="intake-shell card">
        <div className="intake-header">
          <div className="intake-progress">
            {STEPS.map((label, i) => (
              <div key={label} className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
            ))}
          </div>
          <button className="btn btn-ghost" type="button" onClick={loadExample}>
            Load example patient
          </button>
        </div>

        <h2 className="intake-step-title">{STEPS[step]}</h2>

        <div className="intake-body">
          {step === 0 && <BasicsStep basics={patient.basics} updateBasics={updateBasics} />}
          {step === 1 && (
            <CycleStep
              cycles={patient.cycles}
              addCycle={addCycle}
              updateCycle={updateCycle}
              removeCycle={removeCycle}
            />
          )}
          {step === 2 && <SymptomsStep symptoms={patient.symptoms} updateSymptom={updateSymptom} />}
          {step === 3 && <LabsStep labsDone={patient.labsDone} updateLab={updateLab} />}
          {step === 4 && (
            <TreatmentsStep
              treatments={patient.treatmentsTried}
              addTreatment={addTreatment}
              updateTreatment={updateTreatment}
              removeTreatment={removeTreatment}
            />
          )}
          {step === 5 && (
            <HistoryStep
              value={patient.freeTextHistory}
              onChange={(v) => setPatient((p) => ({ ...p, freeTextHistory: v }))}
            />
          )}
        </div>

        <div className="intake-footer">
          <button className="btn btn-secondary" type="button" onClick={goPrev}>
            Back
          </button>
          <button className="btn btn-primary" type="button" onClick={goNext} disabled={!canGoNext}>
            {isLastStep ? 'Generate my brief' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BasicsStep({ basics, updateBasics }) {
  return (
    <div className="field-stack">
      <label className="field">
        <span>Age</span>
        <input
          type="number"
          min="12"
          max="60"
          value={basics.age}
          onChange={(e) => updateBasics('age', e.target.value)}
          placeholder="27"
        />
      </label>
      <label className="field">
        <span>Roughly how many years have you had symptoms?</span>
        <input
          type="number"
          min="0"
          max="50"
          value={basics.yearsOfSymptoms}
          onChange={(e) => updateBasics('yearsOfSymptoms', e.target.value)}
          placeholder="4"
        />
      </label>
    </div>
  )
}

function CycleStep({ cycles, addCycle, updateCycle, removeCycle }) {
  return (
    <div className="field-stack">
      <p className="step-help">
        Add each cycle start date and its length in days (start of one period to the start of the
        next). The more history, the sharper the pattern — aim for your last 6–12 cycles.
      </p>
      {cycles.length === 0 && <p className="empty-hint">No cycles added yet.</p>}
      <div className="repeat-list">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="repeat-row">
            <label className="field field-inline">
              <span>Start date</span>
              <input
                type="date"
                value={cycle.startDate}
                onChange={(e) => updateCycle(cycle.id, 'startDate', e.target.value)}
              />
            </label>
            <label className="field field-inline field-narrow">
              <span>Length (days)</span>
              <input
                type="number"
                min="1"
                max="180"
                value={cycle.length}
                onChange={(e) => updateCycle(cycle.id, 'length', e.target.value)}
                placeholder="29"
              />
            </label>
            <button
              type="button"
              className="btn btn-ghost remove-btn"
              onClick={() => removeCycle(cycle.id)}
              aria-label="Remove cycle"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary" onClick={addCycle}>
        + Add a cycle
      </button>
    </div>
  )
}

function SymptomsStep({ symptoms, updateSymptom }) {
  return (
    <div className="field-stack">
      <p className="step-help">Select anything you've experienced, even intermittently.</p>
      <div className="checkbox-grid">
        {SYMPTOM_OPTIONS.map((opt) => (
          <label key={opt.id} className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(symptoms[opt.id])}
              onChange={(e) => updateSymptom(opt.id, e.target.checked)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function LabsStep({ labsDone, updateLab }) {
  return (
    <div className="field-stack">
      <p className="step-help">Check anything already tested — even years ago. This is what your brief checks for gaps against.</p>
      <div className="checkbox-grid">
        {INDICATED_TESTS.map((test) => (
          <label key={test.id} className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(labsDone[test.id])}
              onChange={(e) => updateLab(test.id, e.target.checked)}
            />
            <span>{test.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function TreatmentsStep({ treatments, addTreatment, updateTreatment, removeTreatment }) {
  return (
    <div className="field-stack">
      <p className="step-help">Anything you've tried — prescribed or self-directed.</p>
      {treatments.length === 0 && <p className="empty-hint">No treatments added yet.</p>}
      <div className="repeat-list">
        {treatments.map((t) => (
          <div key={t.id} className="repeat-row repeat-row-wide">
            <label className="field field-inline">
              <span>Treatment</span>
              <input
                type="text"
                value={t.name}
                onChange={(e) => updateTreatment(t.id, 'name', e.target.value)}
                placeholder="Metformin 500mg"
              />
            </label>
            <label className="field field-inline field-narrow">
              <span>Duration</span>
              <input
                type="text"
                value={t.duration}
                onChange={(e) => updateTreatment(t.id, 'duration', e.target.value)}
                placeholder="6 weeks"
              />
            </label>
            <label className="field field-inline field-narrow">
              <span>Outcome</span>
              <select value={t.outcome} onChange={(e) => updateTreatment(t.id, 'outcome', e.target.value)}>
                {OUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-ghost remove-btn" onClick={() => removeTreatment(t.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary" onClick={addTreatment}>
        + Add a treatment
      </button>
    </div>
  )
}

function HistoryStep({ value, onChange }) {
  return (
    <div className="field-stack">
      <p className="step-help">
        Tell it like you'd tell a friend. This won't be quoted directly in your brief — it's rephrased
        into clinical language, and only claims traceable to what you enter here are included.
      </p>
      <label className="field">
        <span>Your history, in your own words</span>
        <textarea
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Periods have never been regular... tried the pill which helped, came off it last year..."
        />
      </label>
    </div>
  )
}
