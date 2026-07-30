import { useMemo } from 'react'
import { detectClinicalGaps } from '../lib/ruleEngine'
import { inferOvulationPattern } from '../lib/ovulationInference'
import { generateClinicalNarrative } from '../lib/narrativeGenerator'
import './ClinicalBrief.css'

const CLASSIFICATION_LABEL = {
  'likely-ovulatory': { label: 'Likely ovulatory', tagClass: 'tag-ok' },
  'likely-anovulatory': { label: 'Likely anovulatory', tagClass: 'tag-warn' },
  indeterminate: { label: 'Indeterminate', tagClass: 'tag-neutral' },
}

export default function ClinicalBrief({ patient, onEdit, onRestart }) {
  const gapReport = useMemo(() => detectClinicalGaps(patient), [patient])
  const ovulationReport = useMemo(() => inferOvulationPattern(patient.cycles), [patient])
  const narrativeReport = useMemo(
    () => generateClinicalNarrative(patient, gapReport, ovulationReport),
    [patient, gapReport, ovulationReport],
  )

  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="brief-page">
      <div className="brief-toolbar no-print">
        <button className="btn btn-ghost" onClick={onEdit}>
          ← Edit answers
        </button>
        <div className="brief-toolbar-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print / save as PDF
          </button>
          <button className="btn btn-primary" onClick={onRestart}>
            Start a new brief
          </button>
        </div>
      </div>

      <div className="brief-sheet card">
        <header className="brief-header">
          <div>
            <span className="wordmark-small">Ovary</span>
            <h1>Clinical brief</h1>
          </div>
          <div className="brief-meta">
            <div>Generated {today}</div>
            {patient.basics?.age && <div>Age {patient.basics.age}</div>}
          </div>
        </header>

        <p className="brief-disclaimer">
          This brief infers patterns from patient-reported history. It does not diagnose. All
          claims below are traceable to information the patient supplied — see the traceability
          note at the end.
        </p>

        <section className="brief-section">
          <h2>Ovulation pattern</h2>
          <p className="brief-summary-line">{ovulationReport.summary}</p>
          {ovulationReport.classifiedCycles.length > 0 && (
            <div className="cycle-table">
              <div className="cycle-table-header">
                <span>Start date</span>
                <span>Length</span>
                <span>Assessment</span>
                <span>Basis</span>
              </div>
              {ovulationReport.classifiedCycles.map((c) => {
                const meta = CLASSIFICATION_LABEL[c.classification]
                return (
                  <div className="cycle-table-row" key={c.id || c.startDate}>
                    <span>{c.startDate}</span>
                    <span>{c.length ? `${c.length}d` : '—'}</span>
                    <span>
                      <span className={`tag ${meta.tagClass}`}>{meta.label}</span>
                    </span>
                    <span className="cycle-note">{c.note}</span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="brief-caveat">
            Inferred from cycle length and cycle-to-cycle variability only — not measured via BBT,
            LH, or serum progesterone. Treat as a pattern to discuss, not a confirmed diagnosis.
          </p>
        </section>

        <section className="brief-section">
          <h2>Rotterdam criteria snapshot</h2>
          <div className="criteria-grid">
            {Object.values(gapReport.rotterdamStatus).map((c) => (
              <div className="criteria-card" key={c.criterion}>
                <h3>{c.criterion}</h3>
                <p className="criteria-status">{c.status}</p>
                <p className="criteria-basis">{c.basis}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="brief-section">
          <h2>History, in clinical terms</h2>
          <p className="brief-narrative">{narrativeReport.narrative}</p>
        </section>

        <section className="brief-section">
          <h2>Three highest-yield questions</h2>
          <ol className="question-list">
            {narrativeReport.highestYieldQuestions.map((q) => (
              <li key={q.text}>{q.text}</li>
            ))}
            {narrativeReport.highestYieldQuestions.length === 0 && (
              <li className="empty-hint">Not enough data to generate targeted questions yet.</li>
            )}
          </ol>
        </section>

        <section className="brief-section">
          <h2>Indicated tests missing from file</h2>
          {gapReport.missingTests.length === 0 ? (
            <p>No gaps detected against the checks this tool runs.</p>
          ) : (
            <div className="test-list">
              {gapReport.missingTests.map((t, i) => (
                <div className="test-row" key={t.id}>
                  <span className="test-rank">{i + 1}</span>
                  <div>
                    <h3>{t.name}</h3>
                    <p>{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {gapReport.recordedTests.length > 0 && (
          <section className="brief-section">
            <h2>Already on file</h2>
            <div className="recorded-tags">
              {gapReport.recordedTests.map((t) => (
                <span className="tag tag-ok" key={t.id}>
                  {t.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="brief-footer">
          <span
            className={`tag ${narrativeReport.traceability.passed ? 'tag-ok' : 'tag-warn'}`}
          >
            Traceability: {narrativeReport.traceability.totalClaims - narrativeReport.traceability.untracedCount}/
            {narrativeReport.traceability.totalClaims} claims traced to patient input
          </span>
          <p>
            Ovary is not a diagnostic device and does not replace clinical judgment. Bring this
            brief to your appointment as a discussion aid.
          </p>
        </footer>
      </div>
    </div>
  )
}
