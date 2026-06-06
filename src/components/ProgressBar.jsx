import { campaignDefaults, formatCurrency, percentRaised } from '../lib/campaign';

export default function ProgressBar({ raised, target = campaignDefaults.targetAmount }) {
  const progress = percentRaised(raised, target);

  return (
    <section className="panel progress-panel">
      <div className="section-heading">
        <span className="eyebrow">Fund progress</span>
        <h2>Every contribution brings the treatment closer to completion.</h2>
      </div>

      <div className="progress-meta">
        <div>
          <p className="meta-label">Raised</p>
          <strong>{formatCurrency(raised)}</strong>
        </div>
        <div>
          <p className="meta-label">Target</p>
          <strong>{formatCurrency(target)}</strong>
        </div>
        <div>
          <p className="meta-label">Progress</p>
          <strong>{progress}%</strong>
        </div>
      </div>

      <div className="progress-track" aria-label={`Raised ${progress} percent of target`}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
