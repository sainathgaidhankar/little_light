import { useState } from 'react';
import DonationForm from '../components/DonationForm';
import BankDetails from '../components/BankDetails';
import ProgressBar from '../components/ProgressBar';
import { useCampaign } from '../context/CampaignContext';
import { campaignDefaults } from '../lib/campaign';
import qrImage from '/images/Qr.jpeg';

export default function DonatePage() {
  const { campaign } = useCampaign();
  const [copyStatus, setCopyStatus] = useState('');

  const copyUpi = async () => {
    if (!campaignDefaults.bankUpiId) {
      setCopyStatus('UPI ID is not configured.');
      return;
    }

    try {
      await navigator.clipboard.writeText(campaignDefaults.bankUpiId);
      setCopyStatus('UPI ID copied.');
    } catch {
      setCopyStatus('Could not copy the UPI ID.');
    }
  };

  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Donate</span>
        <h1>Donate securely through Razorpay, with UPI QR as fallback.</h1>
        <p className="body-copy">
          Enter your name and amount. The website uses Razorpay for the actual payment checkout,
          while QR and UPI ID are shown separately for manual payments if needed.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
          <section className="panel">
            <div className="section-heading">
              <span className="eyebrow">Fast pay</span>
              <h2>Scan QR or copy the UPI ID for manual payment.</h2>
            </div>
            <div className="donate-quick-pay">
              <img src={qrImage} alt="Donation QR code" className="donate-qr" />
              <div className="donate-quick-pay-copy">
                <p className="body-copy">
                  If you prefer direct UPI payment, scan this QR in Google Pay, PhonePe, Paytm, or
                  any UPI app.
                </p>
                <p className="meta-label">UPI ID</p>
                <strong>{campaignDefaults.bankUpiId || 'Add in Appwrite'}</strong>
                <div className="donate-actions">
                  <button type="button" className="ghost-button" onClick={copyUpi}>
                    Copy UPI ID
                  </button>
                </div>
                {copyStatus ? <p className="status-message">{copyStatus}</p> : null}
              </div>
            </div>
          </section>
          <BankDetails />
        </div>
      </div>
    </div>
  );
}
