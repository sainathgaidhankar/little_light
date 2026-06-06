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
        <h1>Donate in one checkout.</h1>
        <p className="body-copy">
          Enter your name and amount, click Donate, and the checkout will show the payment methods
          available on the donor&apos;s device. After payment, the donation is stored in Appwrite
          and later verified by admin.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
          <section className="panel">
            <div className="section-heading">
              <span className="eyebrow">Fast pay</span>
              <h2>QR and UPI ID as backup.</h2>
            </div>
            <div className="donate-quick-pay">
              <img src={qrImage} alt="Donation QR code" className="donate-qr" />
              <div className="donate-quick-pay-copy">
                <p className="body-copy">
                  If the donor&apos;s device shows no checkout, scan this QR or copy the UPI ID and
                  pay in the UPI app directly.
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
