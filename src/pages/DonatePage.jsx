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
        <h1>Choose a payment method.</h1>
        <p className="body-copy">
          Enter your name and amount, click Donate now, and pick UPI, direct bank, net banking,
          or Razorpay. If you choose UPI, the phone can open the installed apps on supported
          devices, including PhonePe, Google Pay, Paytm, BHIM, and other UPI apps. After payment,
          the donation is stored in Appwrite and later verified by admin.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
          <details className="panel fallback-pay-panel">
            <summary className="fallback-pay-summary">
              <div>
                <span className="eyebrow">More ways to pay</span>
                <h2>QR and bank transfer backup</h2>
              </div>
              <span className="fallback-pay-hint">Open</span>
            </summary>
            <div className="fallback-pay-content">
              <div className="donate-quick-pay">
                <img src={qrImage} alt="Donation QR code" className="donate-qr" />
                <div className="donate-quick-pay-copy">
                  <p className="body-copy">
                    If the checkout does not open, scan this QR or copy the UPI ID and pay in the
                    UPI app directly.
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
              <BankDetails />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
