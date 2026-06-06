import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import UpdateTimeline from '../components/UpdateTimeline';
import BankDetails from '../components/BankDetails';
import { useCampaign } from '../context/CampaignContext';
import { formatCurrency } from '../lib/campaign';
import patientImagePrimary from '/images/patiente.webp';
import patientImageSecondary from '/images/patiente-2.webp';
import reportImage1 from '/images/report-1.jpg';
import reportImage2 from '/images/report-2.jpg';
import reportImage3 from '/images/report-3.jpg';
import reportImage4 from '/images/report-4.jpeg';
import reportImage5 from '/images/report-5.jpeg';
import qrImage from '/images/Qr.jpeg';

function Initials({ name }) {
  const letters = String(name || 'D')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return <div className="donor-avatar">{letters || 'D'}</div>;
}

export default function HomePage() {
  const { campaign, updates, donationHistory, loading, error } = useCampaign();
  const [patientSlide, setPatientSlide] = useState(0);
  const [documentSlide, setDocumentSlide] = useState(0);

  const hasStory = Boolean(campaign.story);
  const patientSlides = [patientImagePrimary, patientImageSecondary];
  const documentSlides = [
    reportImage1,
    reportImage2,
    reportImage3,
    reportImage4,
    reportImage5,
  ];
  const currentPatient = patientSlides[patientSlide % patientSlides.length];
  const currentDocument = documentSlides[documentSlide % documentSlides.length];

  const stepSlide = (setter, total) => (direction) => {
    setter((current) => (current + direction + total) % total);
  };

  const movePatient = stepSlide(setPatientSlide, patientSlides.length);
  const moveDocument = stepSlide(setDocumentSlide, documentSlides.length);

  return (
    <div className="page-stack">
      <div className="page-tabs">
        <Link to="/" className="page-tab active">
          Story
        </Link>
        <Link to="/updates" className="page-tab">
          Comment(0)
        </Link>
      </div>

      <section className="hero">
        <div className="hero-left">
          <article className="panel hero-image">
            <img
              className="hero-image-photo"
              src={currentPatient}
              alt="Patient in neonatal care"
            />
            <div className="hero-image-caption">
              <strong>Patient in NICU care</strong>
              <p style={{ margin: '6px 0 0' }}>
                The primary patient image is now loaded from the uploaded images folder.
              </p>
            </div>
            <button
              className="slider-arrow left"
              type="button"
              onClick={() => movePatient(-1)}
              aria-label="Previous patient image"
            >
              ‹
            </button>
            <button
              className="slider-arrow right"
              type="button"
              onClick={() => movePatient(1)}
              aria-label="Next patient image"
            >
              ›
            </button>
          </article>

          <div className="gallery-strip">
            {patientSlides.map((src, index) => (
              <button
                key={src}
                type="button"
                className={`thumb-button ${patientSlide === index ? 'active' : ''}`}
                onClick={() => setPatientSlide(index)}
                aria-label={`Show patient image ${index + 1}`}
              >
                <img className="thumb" src={src} alt={`Patient thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>

          <section className="panel story-panel">
            <h2 className="section-title">Story</h2>
            {hasStory ? (
              <p className="story-text">{campaign.story}</p>
            ) : (
              <p className="body-copy">
                No story has been added in Appwrite yet. Add the real fundraiser story to display it
                here.
              </p>
            )}
          </section>

          <section className="panel">
            <h2 className="section-title">Campaigner Details</h2>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-avatar">SI</div>
                <div className="detail-content">
                  <div className="detail-heading">
                    <h3>Campaigner Details</h3>
                    <span className="verified-pill">VERIFIED</span>
                  </div>
                  <p className="detail-name">shehbaaz imam</p>
                  <p className="detail-meta">Hyderabad, Telangana</p>
                  <a className="detail-contact" href="/contact">
                    Contact
                  </a>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-avatar">BO</div>
                <div className="detail-content">
                  <div className="detail-heading">
                    <h3>Beneficiary Details</h3>
                    <span className="verified-pill">VERIFIED</span>
                  </div>
                  <p className="detail-name">{campaign.beneficiaryName || 'Baby of Shehbaaz Imam Sahab'}</p>
                  <p className="detail-meta">Child of shehbaaz imam</p>
                  <p className="detail-meta">
                    Patient hospitalised at {campaign.hospitalName || 'Medicover Woman and Child Hospital'}
                  </p>
                  <p className="detail-meta">{campaign.hospitalAddress || 'Hyderabad'}</p>
                </div>
              </div>
              <div className="detail-card location-card">
                <div className="detail-avatar">MAP</div>
                <div className="detail-content">
                  <div className="detail-heading">
                    <h3>Hospital Location</h3>
                  </div>
                  <p className="detail-name">{campaign.hospitalName || 'Medicover Woman and Child Hospital'}</p>
                  <p className="detail-meta">{campaign.hospitalAddress || 'Hyderabad'}</p>
                  <a
                    className="detail-contact location-button"
                    href={campaign.hospitalMapUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div className="detail-card location-card">
                <div className="detail-avatar">PH</div>
                <div className="detail-content">
                  <div className="detail-heading">
                    <h3>Patient Contact</h3>
                  </div>
                  <p className="detail-name">
                    {campaign.patientContactNumber || 'Contact number not added yet'}
                  </p>
                  {campaign.patientContactNumber ? (
                    <a className="detail-contact location-button" href={`tel:${campaign.patientContactNumber}`}>
                      Call Patient Contact
                    </a>
                  ) : (
                    <p className="detail-meta">Add the patient contact number in Appwrite or env.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <UpdateTimeline updates={updates} />
          <section className="panel documents-panel">
            <div className="section-heading documents-heading">
              <h2 className="section-title">Documents</h2>
              <div className="slider-controls">
                <button type="button" className="ghost-button small" onClick={() => moveDocument(-1)}>
                  Prev
                </button>
                <button type="button" className="ghost-button small" onClick={() => moveDocument(1)}>
                  Next
                </button>
              </div>
            </div>
            <div className="documents-slider">
              <figure className="document-preview">
                <img src={currentDocument} alt={`Document ${documentSlide + 1}`} />
                <figcaption>
                  Document {documentSlide + 1} of {documentSlides.length}
                </figcaption>
              </figure>
              <div className="document-thumbs">
                {documentSlides.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className={`document-thumb ${documentSlide === index ? 'active' : ''}`}
                    onClick={() => setDocumentSlide(index)}
                    aria-label={`Show document ${index + 1}`}
                  >
                    <img src={src} alt={`Document thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="stack-column">
          <section className="panel donation-panel">
            <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
            <div className="cta-stack">
              <div className="sidebar-share">SHARE ON FACEBOOK</div>
              <Link to="/donate" className="primary-button cta-donate">
                DONATE NOW
              </Link>
            </div>
            <p className="donation-quick-note cta-note">(INDIAN TAX BENEFITS AVAILABLE)</p>

            <section className="subtle-card">
              <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
                Donate via Paytm/Google Pay/PhonePe
              </h3>
              <div className="qr-card">
                <img src={qrImage} alt="Donation QR code" />
                <p className="donation-quick-note">
                  Scan the QR code to donate directly through UPI.
                </p>
              </div>
            </section>

            <section className="subtle-card">
              <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
                Beneficiary details
              </h3>
              <p className="body-copy">Add the verified beneficiary payment details in Appwrite.</p>
            </section>

            <BankDetails />
          </section>

          <section className="panel">
            <div className="section-heading">
              <h2 className="section-title">Donors</h2>
            </div>
            <div className="donor-list">
              {donationHistory.length ? (
                donationHistory.map((donation) => (
                  <div className="donor-row" key={donation.$id}>
                    <Initials name={donation.donorName} />
                    <div>
                      <strong>
                        {donation.donorName || 'Anonymous'} - {formatCurrency(donation.amount)}
                      </strong>
                      <p>{donation.paymentMethod || 'Online payment'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="body-copy">No donations have been synced from Appwrite yet.</p>
              )}
            </div>
            <div className="donor-list-footer">
              <span>{donationHistory.length} donation{donationHistory.length === 1 ? '' : 's'} recorded in Appwrite</span>
            </div>
          </section>
        </aside>
      </section>

      <section className="panel">
        <h2 className="section-title">Funds will be transferred for patient&apos;s treatment</h2>
        <p className="body-copy">
          The campaign is designed to keep the payment path direct, secure, and transparent. Add
          the real donation and update records in Appwrite to populate this page.
        </p>
      </section>

      {loading ? <p className="status-message">Loading campaign data...</p> : null}
      {error ? <p className="status-message error">{error}</p> : null}

      <div className="bottom-bar">
        <div className="bottom-bar-inner">
          <div className="bottom-bar-title">{campaign.title || 'Support this fundraiser'}</div>
          <Link to="/donate" className="primary-button">
            DONATE NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
