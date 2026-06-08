import { useMemo, useState } from 'react';

export default function DocumentGallery({ documents = [] }) {
  const [preview, setPreview] = useState(null);

  const previewType = useMemo(() => {
    if (!preview?.url) return 'unknown';
    if (
      preview.mimeType?.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(preview.url)
    ) {
      return 'image';
    }
    if (preview.mimeType?.includes('pdf') || /\.pdf$/i.test(preview.url)) {
      return 'pdf';
    }
    return 'file';
  }, [preview]);

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <span className="eyebrow">Transparency</span>
          <h2>Hospital bills and doctor letters.</h2>
        </div>

        <div className="document-grid">
          {documents.map((doc) => (
            <button
              key={doc.$id}
              type="button"
              className="document-card document-card-button"
              onClick={() => doc.url && setPreview(doc)}
              disabled={!doc.url}
            >
              <div className="document-card-copy">
                <p className="document-name">{doc.name}</p>
                <p className="document-meta">{doc.mimeType || 'Medical document'}</p>
              </div>
              <span className="ghost-button small">Open</span>
            </button>
          ))}
        </div>
      </section>

      {preview?.url ? (
        <div
          className="gallery-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={preview.name || 'Document preview'}
          onClick={() => setPreview(null)}
        >
          <div className="gallery-modal document-preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-modal-head">
              <span className="gallery-modal-title">{preview.name || 'Document preview'}</span>
              <button type="button" className="ghost-button small" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>

            <div className="gallery-modal-view document-preview-frame">
              {previewType === 'image' ? (
                <img
                  src={preview.url}
                  alt={preview.name || 'Document preview'}
                  className="gallery-modal-image"
                />
              ) : previewType === 'pdf' ? (
                <iframe
                  title={preview.name || 'Document preview'}
                  src={preview.url}
                  className="document-preview-iframe"
                />
              ) : (
                <div className="upi-qr-empty">
                  This file type cannot be previewed inline.
                  <a href={preview.url} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
