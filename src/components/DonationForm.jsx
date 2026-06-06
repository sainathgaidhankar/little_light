import { useMemo, useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { openRazorpayCheckout } from '../lib/payment';

const quickAmounts = [500, 1000, 2500, 5000];

const initialState = {
  name: '',
  amount: '',
};

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const selectedAmount = useMemo(() => Number(form.amount || 0), [form.amount]);

  const handleDonate = async () => {
    setSubmitting(true);
    setStatus('');

    try {
      if (!form.name || !selectedAmount) {
        throw new Error('Please enter your name and donation amount.');
      }

      await openRazorpayCheckout({
        donor: {
          name: form.name,
          createdFrom: 'razorpay',
        },
        amount: selectedAmount,
        onSuccess: (result) => {
          setStatus('Payment completed and stored in Appwrite.');
          setForm(initialState);
          onComplete?.(result);
        },
        onError: (message) => {
          setStatus(message);
        },
        onPending: (message) => {
          setStatus(message);
        },
      });
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="panel donation-form"
      onSubmit={(event) => {
        event.preventDefault();
        handleDonate();
      }}
    >
      <div className="section-heading">
        <span className="eyebrow">Donate now</span>
        <h2>Pay with UPI, card, or net banking.</h2>
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
        {submitting ? 'Opening checkout...' : 'Donate now'}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
      <p className="form-note">
        One checkout opens the payment methods available for the donor&apos;s device and location.
        After successful payment, the donation is stored in Appwrite and counted only after
        verification.
      </p>
    </form>
  );
}
