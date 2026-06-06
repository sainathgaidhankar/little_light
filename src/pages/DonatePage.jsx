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
        <h1>Donate through Google Pay, PhonePe, or Paytm.</h1>
        <p className="body-copy">
          Enter your name and amount, choose the app you want, and we will open it with the
          payment ready. After payment, share the UTR or screenshot with the admin for
          verification.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
          <section className="panel">
            <div className="section-heading">
              <span className="eyebrow">Fast pay</span>
              <h2>Scan QR, or copy the UPI ID if your app needs it.</h2>
            </div>
            <div className="donate-quick-pay">
              <img src={qrImage} alt="Donation QR code" className="donate-qr" />
              <div className="donate-quick-pay-copy">
                <p className="body-copy">
                  Choose Google Pay, PhonePe, or Paytm in the form. If your app does not open,
                  scan this QR or copy the UPI ID here.
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
