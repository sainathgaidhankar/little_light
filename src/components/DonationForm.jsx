import { useMemo, useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { createDonationExecution, openUpiIntent } from '../lib/payment';

const quickAmounts = [500, 1000, 2500, 5000];

const initialState = {
  name: '',
  amount: '',
};

const upiApps = [
  { id: 'google_pay', label: 'Google Pay' },
  { id: 'phonepe', label: 'PhonePe' },
  { id: 'paytm', label: 'Paytm' },
];

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const selectedAmount = useMemo(() => Number(form.amount || 0), [form.amount]);

  const buildPendingPayload = (gateway) => ({
    donor: {
      name: form.name,
      createdFrom: `upi-${gateway}`,
    },
    amount: selectedAmount,
    currency: campaignDefaults.currency,
    paymentMethod: 'upi_manual',
    gateway,
    status: 'pending',
    transactionRef: `UPI-${Date.now()}`,
    utrNumber: '',
  });

  const launchUpiPayment = async (gateway) => {
    setSubmitting(true);
    setStatus('');

    try {
      if (!form.name || !selectedAmount) {
        throw new Error('Please enter your name and donation amount.');
      }

      const result = await createDonationExecution(buildPendingPayload(gateway));
      if (!result.ok) {
        throw new Error(result.message || 'Unable to create donation record.');
      }

      const opened = openUpiIntent({
        amount: selectedAmount,
        donorName: form.name,
        onError: (message) => setStatus(message),
      });

      if (!opened) {
        throw new Error('Could not open the UPI app. Use the QR code or copy the UPI ID.');
      }

      setStatus(
        `Opened ${upiApps.find((item) => item.id === gateway)?.label || 'UPI app'}. Complete payment there, then send the UTR or screenshot to admin.`
      );
      setForm(initialState);
      setChooserOpen(false);
      onComplete?.(result);
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const openChooser = () => {
    if (!form.name || !selectedAmount) {
      setStatus('Please enter your name and donation amount.');
      return;
    }

    setStatus('');
    setChooserOpen(true);
  };

  return (
    <form
      className="panel donation-form"
      onSubmit={(event) => {
        event.preventDefault();
        openChooser();
      }}
    >
      <div className="section-heading">
        <span className="eyebrow">Donate now</span>
        <h2>Choose a payment app after you click Donate.</h2>
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
        {submitting ? 'Working...' : 'Donate now'}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
      <p className="form-note">
        No email or registration is required. Click Donate, choose Google Pay, PhonePe, or Paytm,
        and the donation record will be stored in Appwrite as pending until admin verifies the
        UTR/screenshot.
      </p>

      {chooserOpen ? (
        <div className="payment-modal-backdrop" role="presentation" onClick={() => setChooserOpen(false)}>
          <div
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose payment app"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <span className="eyebrow">Select app</span>
              <h2>Choose where to pay</h2>
            </div>
            <div className="upi-app-grid modal-grid">
              {upiApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="upi-app modal-app"
                  disabled={submitting}
                  onClick={() => launchUpiPayment(app.id)}
                >
                  {app.label}
                </button>
              ))}
            </div>
            <button type="button" className="ghost-button modal-close" onClick={() => setChooserOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
