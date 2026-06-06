import { useMemo, useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { createDonationExecution, openUpiIntent } from '../lib/payment';

const quickAmounts = [500, 1000, 2500, 5000];

const initialState = {
  name: '',
  amount: '',
};

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upiApp, setUpiApp] = useState('google_pay');

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const selectedAmount = useMemo(() => Number(form.amount || 0), [form.amount]);

  const submitPendingDonation = async () => {
    const result = await createDonationExecution({
      donor: {
        name: form.name,
        createdFrom: `upi-${upiApp}`,
      },
      amount: selectedAmount,
      currency: campaignDefaults.currency,
      paymentMethod: 'upi_manual',
      gateway: upiApp,
      status: 'pending',
      transactionRef: `UPI-${Date.now()}`,
      utrNumber: '',
    });

    if (!result.ok) throw new Error(result.message || 'Unable to record pledge.');
    return result;
  };

  const handleManualUpi = async () => {
    const result = await submitPendingDonation();
    const opened = openUpiIntent({
      amount: selectedAmount,
      donorName: form.name,
      onError: (message) => setStatus(message),
    });

    if (!opened) {
      setSubmitting(false);
      return;
    }

    setStatus(
      `Opened ${upiApp.replace('_', ' ')}. Complete the payment, then send the UTR or screenshot to admin.`
    );
    setForm(initialState);
    onComplete?.(result);
    setSubmitting(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');

    try {
      if (!form.name || !selectedAmount) {
        throw new Error('Please enter your name and donation amount.');
      }

      await handleManualUpi();
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  const submitLabel = 'Open UPI app';

  return (
    <form className="panel donation-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="eyebrow">Donate now</span>
        <h2>Pay with UPI apps like PhonePe and Google Pay.</h2>
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

      <div className="donation-methods">
        <div className="method-card method-primary active">
          <strong>Choose UPI app</strong>
          <span>Select the app you want to pay with. We will open it with the amount ready.</span>
          <div className="upi-app-grid">
            <button type="button" className={`upi-app ${upiApp === 'google_pay' ? 'active' : ''}`} onClick={() => setUpiApp('google_pay')}>
              Google Pay
            </button>
            <button type="button" className={`upi-app ${upiApp === 'phonepe' ? 'active' : ''}`} onClick={() => setUpiApp('phonepe')}>
              PhonePe
            </button>
            <button type="button" className={`upi-app ${upiApp === 'paytm' ? 'active' : ''}`} onClick={() => setUpiApp('paytm')}>
              Paytm
            </button>
          </div>
        </div>
      </div>

      <button className="primary-button donation-submit" disabled={submitting} type="submit">
        {submitting ? 'Saving...' : submitLabel}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
      <p className="form-note">
        No email or registration is required. Enter your name and amount, then pay manually in
        PhonePe, Google Pay, or any UPI app using the QR or UPI ID on this page. After paying,
        send the UTR or screenshot to admin so the donation can be verified.
      </p>
    </form>
  );
}
