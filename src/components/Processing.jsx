import { useEffect, useState } from 'react'
import './Processing.css'

const STEPS = [
  'Checking labs against Rotterdam and AE-PCOS criteria…',
  'Analyzing cycle length pattern…',
  'Drafting clinical narrative…',
  'Running traceability check…',
]

export default function Processing({ onDone }) {
  const [visibleStep, setVisibleStep] = useState(0)

  useEffect(() => {
    if (visibleStep >= STEPS.length) {
      const timeout = setTimeout(onDone, 450)
      return () => clearTimeout(timeout)
    }
    const timeout = setTimeout(() => setVisibleStep((s) => s + 1), 420)
    return () => clearTimeout(timeout)
  }, [visibleStep, onDone])

  return (
    <div className="processing">
      <div className="processing-card card">
        <span className="eyebrow">Building your brief</span>
        <ul className="processing-steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i < visibleStep ? 'done' : i === visibleStep ? 'active' : ''}>
              <span className="step-marker" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
