import { formatCurrency } from '../lib/campaign';

export default function UpdateTimeline({ updates }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Updates</span>
        <h2>Timeline of treatment, bills, and family notes.</h2>
      </div>

      <div className="timeline">
        {updates.map((update) => (
          <article key={update.$id} className="timeline-card">
            <div className="timeline-topline">
              <span className="timeline-category">{update.category || 'Update'}</span>
              <time>{new Date(update.createdAtISO || update.$createdAt).toLocaleDateString()}</time>
            </div>
            <h3>{update.title}</h3>
            <p>{update.body}</p>
            {Number(update.spentAmount || 0) > 0 ? (
              <p className="expense-line">Spent: {formatCurrency(update.spentAmount)}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
