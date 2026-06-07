import { useMemo, useState } from 'react';
import BankDetails from '../components/BankDetails';
import { campaignDefaults } from '../lib/campaign';
import {
  buildUpiIntentUrl,
  buildUpiQrUrl,
  createDonationExecution,
  openUpiIntent,
} from '../lib/payment';

const quickAmounts = [500, 1000, 2500, 5000];

const paymentTabs = [
  {
    id: 'card',
    label: 'Debit/Credit Card',
    hint: 'Card payment style',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    hint: 'Transfer from bank',
  },
  {
    id: 'upi',
    label: 'UPI',
    hint: 'PhonePe, GPay, Paytm',
  },
];

const upiApps = ['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Other UPI app'];

const initialState = {
  name: '',
  amount: '',
};

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upi');
  const [copyStatus, setCopyStatus] = useState('');

  const selectedAmount = useMemo(() => Number(form.amount || 0), [form.amount]);

  const upiUrl = useMemo(() => {
    if (!selectedAmount) return '';
    return buildUpiIntentUrl({
      amount: selectedAmount,
      note: form.name
        ? `Donation from ${form.name}`
        : `Donation for ${campaignDefaults.beneficiaryName}`,
    });
  }, [form.name, selectedAmount]);

  const qrUrl = useMemo(() => buildUpiQrUrl(upiUrl), [upiUrl]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const recordDonation = async (paymentMethod) => {
    const result = await createDonationExecution({
      donor: {
        name: form.name,
        createdFrom: paymentMethod,
      },
      amount: selectedAmount,
      currency: campaignDefaults.currency,
      paymentMethod,
      gateway: paymentMethod,
      transactionRef: `${paymentMethod}-${Date.now()}`,
      status: 'pending',
    });

    if (!result.ok) {
      throw new Error(result.message || 'Could not start the donation.');
    }

    return result;
  };

  const openPaymentChooser = () => {
    if (!form.name || !selectedAmount) {
      setStatus('Please enter your name and donation amount.');
      return;
    }

    setStatus('');
    setCopyStatus('');
    setActiveTab('upi');
    setShowModal(true);
  };

  const handleUpiPay = async () => {
    setSubmitting(true);
    setStatus('');

    try {
      const pending = await recordDonation('upi');
      setStatus('Opening your UPI app. Complete the payment there.');
      setShowModal(false);
      onComplete?.(pending);
      openUpiIntent({
        amount: selectedAmount,
        donorName: form.name,
        onError: (message) => setStatus(message),
      });
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNetBanking = async () => {
    setSubmitting(true);
    setStatus('');

    try {
      const pending = await recordDonation('netbanking');
      setStatus('Net banking selected. Use the bank details below to transfer the amount.');
      onComplete?.(pending);
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardInfo = () => {
    setStatus('Card payment needs a gateway. Use UPI or Net Banking in this build.');
  };

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
    <>
      <form
        className="panel donation-form"
        onSubmit={(event) => {
          event.preventDefault();
          openPaymentChooser();
        }}
      >
        <div className="section-heading">
          <span className="eyebrow">Donate now</span>
          <h2>Enter your name and amount.</h2>
        </div>

        <label>
          Full name
          <input value={form.name} onChange={updateField('name')} placeholder="Your name" />
        </label>

        <label>
          Donation amount
          <input
            type="number"
            min="100"
            step="100"
            value={form.amount}
            onChange={updateField('amount')}
            placeholder="2500"
          />
        </label>

        <div className="quick-amounts" aria-label="Quick amount options">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`quick-amount ${selectedAmount === amount ? 'active' : ''}`}
              onClick={() => setForm((current) => ({ ...current, amount: String(amount) }))}
            >
              {amount.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        <button className="primary-button donation-submit" disabled={submitting} type="submit">
          {submitting ? 'Opening options...' : 'Donate now'}
        </button>

        {status ? <p className="status-message">{status}</p> : null}
        <p className="form-note">
          Choose a payment mode first. UPI opens the apps on your phone, and on desktop we show a
          QR code. Net banking uses the bank details below.
        </p>
      </form>

      {showModal ? (
        <div className="payment-modal-backdrop" role="dialog" aria-modal="true">
          <div className="payment-modal">
            <button
              type="button"
              className="ghost-button modal-close"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>

            <div className="section-heading">
              <span className="eyebrow">Choose payment mode</span>
              <h2>Select how you want to pay.</h2>
            </div>

            <div className="payment-tabs" role="tablist" aria-label="Payment modes">
              {paymentTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`payment-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <strong>{tab.label}</strong>
                  <span>{tab.hint}</span>
                </button>
              ))}
            </div>

            {activeTab === 'upi' ? (
              <div className="payment-panel">
                <div className="upi-chooser">
                  <div className="upi-qr-card">
                    {qrUrl ? (
                      <img className="upi-qr" src={qrUrl} alt="UPI payment QR code" />
                    ) : (
                      <div className="upi-qr-empty">Set a UPI ID to generate QR</div>
                    )}
                  </div>

                  <div className="upi-copy">
                    <p className="body-copy">
                      Click the button below on mobile to open the installed UPI app. On desktop,
                      scan the QR code with your UPI app.
                    </p>
                    <p className="meta-label">UPI ID</p>
                    <strong>{campaignDefaults.bankUpiId || 'Add in Appwrite'}</strong>
                    <div className="upi-app-grid">
                      {upiApps.map((appName) => (
                        <span key={appName} className="upi-app-chip">
                          {appName}
                        </span>
                      ))}
                    </div>
                    <div className="payment-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleUpiPay}
                        disabled={submitting || !upiUrl}
                      >
                        Open UPI app
                      </button>
                      <button type="button" className="ghost-button" onClick={copyUpi}>
                        Copy UPI ID
                      </button>
                    </div>
                    {copyStatus ? <p className="status-message">{copyStatus}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'netbanking' ? (
              <div className="payment-panel">
                <p className="body-copy">
                  Use your bank app or net banking to transfer the amount. The donation is stored
                  as pending now and can be verified later using the transaction reference.
                </p>
                <BankDetails />
                <div className="payment-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleNetBanking}
                    disabled={submitting}
                  >
                    I have transferred the amount
                  </button>
                </div>
              </div>
            ) : null}

            {activeTab === 'card' ? (
              <div className="payment-panel">
                <p className="body-copy">
                  Card payments need a secure gateway. This build keeps the flow simple and
                  redirects you to UPI or Net Banking instead of showing a fake card form.
                </p>
                <div className="card-hint-grid">
                  <button
                    type="button"
                    className="method-card"
                    onClick={() => setActiveTab('upi')}
                  >
                    <strong>Use UPI</strong>
                    <span>PhonePe, Google Pay, Paytm, BHIM</span>
                  </button>
                  <button
                    type="button"
                    className="method-card"
                    onClick={() => setActiveTab('netbanking')}
                  >
                    <strong>Use Net Banking</strong>
                    <span>Transfer from your bank app</span>
                  </button>
                </div>
                <div className="payment-actions">
                  <button type="button" className="ghost-button" onClick={handleCardInfo}>
                    Card payments need gateway
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
