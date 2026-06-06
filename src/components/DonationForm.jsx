import { useMemo, useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { createDonationExecution, openRazorpayCheckout } from '../lib/payment';

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

  const submitBankTransfer = async () => {
    const result = await createDonationExecution({
      donor: {
        name: form.name,
        createdFrom: 'bank-transfer',
      },
      amount: selectedAmount,
      currency: campaignDefaults.currency,
      paymentMethod: 'bank_transfer',
      gateway: 'manual',
      status: 'pending_bank_transfer',
      transactionRef: `BANK-${Date.now()}`,
      utrNumber: '',
    });

    if (!result.ok) throw new Error(result.message || 'Unable to record pledge.');
    return result;
  };

  const handleRazorpay = async () => {
    await openRazorpayCheckout({
      donor: {
        name: form.name,
        createdFrom: 'razorpay',
      },
      amount: selectedAmount,
      onSuccess: (result) => {
        setStatus('Payment complete and logged securely.');
        setForm(initialState);
        setSubmitting(false);
        onComplete?.(result);
      },
      onError: (message) => {
        setStatus(message);
        setSubmitting(false);
      },
      onPending: (message) => {
        setStatus(message);
        setSubmitting(false);
      },
    });
  };

  const handleBankTransfer = async () => {
    const result = await submitBankTransfer();
    setStatus('Bank transfer reference saved. Add the UTR later if needed.');
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

      await handleRazorpay();
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  const submitLabel = 'Continue with Razorpay';

  return (
    <form className="panel donation-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="eyebrow">Donate now</span>
        <h2>Pay securely with Razorpay.</h2>
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
        <button type="button" className="method-card method-primary active" disabled={submitting}>
          <strong>Pay with Razorpay</strong>
          <span>Use UPI, PhonePe, Google Pay, card, or net banking in one secure checkout.</span>
        </button>

        <button
          type="button"
          className="method-card"
          onClick={handleBankTransfer}
          disabled={submitting}
        >
          <strong>Bank transfer</strong>
          <span>Use the direct beneficiary account if you prefer manual transfer.</span>
        </button>
      </div>

      <button className="primary-button donation-submit" disabled={submitting} type="submit">
        {submitting ? 'Opening payment...' : submitLabel}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
      <p className="form-note">
        No email or registration is required. Enter your name, choose an amount, and pay with the
        method you already use.
      </p>
    </form>
  );
}
