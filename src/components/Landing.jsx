import './Landing.css'

export default function Landing({ onStart }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <span className="wordmark">Ovary</span>
          <button className="btn btn-ghost" onClick={onStart}>
            Start your brief
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Before your next appointment</span>
          <h1>
            Twelve minutes with your doctor.
            <br />
            Walk in with leverage.
          </h1>
          <p className="hero-lede">
            PCOS affects roughly 1 in 10 women. Standard care ends at diagnosis — generic diet
            advice, and years of self-experimentation. Ovary turns your cycle history, labs, and
            failed treatments into a one-page clinical brief: a quantified ovulation pattern, the
            questions your history warrants, and the tests missing from your file.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onStart}>
              Build my clinical brief — €24
            </button>
            <span className="hero-note">Paid before the appointment. No account needed.</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-inner">
          <span className="eyebrow">Why this exists</span>
          <h2>Cycle-tracking math assumes ovulation. Irregular or absent ovulation is the diagnosis.</h2>
          <p>
            Every phase-based app breaks hardest for the population it targets. If your cycles
            aren't predictable, calendar logic isn't tracking your fertility — it's guessing. Ovary
            doesn't predict a fertile window it can't see. It says so, and shows you what the
            pattern actually looks like.
          </p>
        </div>
      </section>

      <section className="section-block section-steps">
        <div className="section-inner">
          <span className="eyebrow">How it works</span>
          <h2>Three inputs. One page your doctor can use in seconds.</h2>
          <div className="steps-grid">
            <div className="card step-card">
              <span className="step-number">01</span>
              <h3>Your cycle &amp; symptom history</h3>
              <p>Dates, lengths, symptoms, and what you've already tried — in your own words.</p>
            </div>
            <div className="card step-card">
              <span className="step-number">02</span>
              <h3>Deterministic gap check</h3>
              <p>
                Your labs are checked against Rotterdam and AE-PCOS criteria. Rule-based, auditable —
                this part can't hallucinate.
              </p>
            </div>
            <div className="card step-card">
              <span className="step-number">03</span>
              <h3>Your one-page brief</h3>
              <p>
                A quantified ovulation pattern, the three highest-yield questions, and the tests
                missing from your file — starting with fasting insulin and HOMA-IR.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block section-disclaimer">
        <div className="section-inner disclaimer-inner">
          <h3>What this is not</h3>
          <p>
            Ovary does not diagnose. It infers a likely ovulation pattern from cycle length and says
            so explicitly — it does not measure ovulation directly. The clinician stays the
            diagnostician. You get armed with a sharper version of your own history.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Ovary</span>
        <button className="btn btn-secondary" onClick={onStart}>
          Start your brief
        </button>
      </footer>
    </div>
  )
}
