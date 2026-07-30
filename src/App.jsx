import { useState } from 'react'
import Landing from './components/Landing'
import IntakeForm from './components/IntakeForm'
import Processing from './components/Processing'
import ClinicalBrief from './components/ClinicalBrief'

const STAGES = {
  LANDING: 'landing',
  INTAKE: 'intake',
  PROCESSING: 'processing',
  BRIEF: 'brief',
}

export default function App() {
  const [stage, setStage] = useState(STAGES.LANDING)
  const [patient, setPatient] = useState(null)

  return (
    <>
      {stage === STAGES.LANDING && <Landing onStart={() => setStage(STAGES.INTAKE)} />}

      {stage === STAGES.INTAKE && (
        <IntakeForm
          onBack={() => setStage(STAGES.LANDING)}
          onComplete={(data) => {
            setPatient(data)
            setStage(STAGES.PROCESSING)
          }}
        />
      )}

      {stage === STAGES.PROCESSING && <Processing onDone={() => setStage(STAGES.BRIEF)} />}

      {stage === STAGES.BRIEF && patient && (
        <ClinicalBrief
          patient={patient}
          onEdit={() => setStage(STAGES.INTAKE)}
          onRestart={() => {
            setPatient(null)
            setStage(STAGES.LANDING)
          }}
        />
      )}
    </>
  )
}
