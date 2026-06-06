export default function DocumentGallery({ documents = [] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Transparency</span>
        <h2>Hospital bills and doctor letters.</h2>
      </div>

      <div className="document-grid">
        {documents.map((doc) => (
          <div key={doc.$id} className="document-card">
            <div>
              <p className="document-name">{doc.name}</p>
              <p className="document-meta">{doc.mimeType || 'Medical document'}</p>
            </div>
            {doc.url ? (
              <a className="ghost-button small" href={doc.url} target="_blank" rel="noreferrer">
                View
              </a>
            ) : (
              <button className="ghost-button small" type="button">
                View
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
