import { useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { createDonationExecution, openRazorpayCheckout } from '../lib/payment';

const initialState = {
  name: '',
  amount: '',
  paymentMethod: 'razorpay',
  utrNumber: '',
};

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitBankTransfer = async () => {
    const result = await createDonationExecution({
      donor: {
        name: form.name,
        createdFrom: 'bank-transfer',
      },
      amount: Number(form.amount),
      currency: campaignDefaults.currency,
      paymentMethod: 'bank_transfer',
      gateway: 'manual',
      status: 'pending_bank_transfer',
      transactionRef: `BANK-${Date.now()}`,
      utrNumber: form.utrNumber,
    });

    if (!result.ok) throw new Error(result.message || 'Unable to record pledge.');
    return result;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');

    try {
      if (!form.name || !form.amount) {
        throw new Error('Please fill in name and amount.');
      }

      if (form.paymentMethod === 'razorpay') {
        await openRazorpayCheckout({
          donor: {
            name: form.name,
            createdFrom: 'razorpay',
          },
          amount: Number(form.amount),
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
        return;
      }

      if (!form.utrNumber) {
        throw new Error('Please enter the UTR / transaction ID for bank transfer.');
      }

      const result = await submitBankTransfer();
      setStatus('Bank transfer pledge logged. Share the transfer reference with the family.');
      setForm(initialState);
      onComplete?.(result);
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      if (form.paymentMethod !== 'razorpay') {
        setSubmitting(false);
      }
    }
  };

  return (
    <form className="panel donation-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="eyebrow">Donate now</span>
        <h2>Make a direct contribution to the beneficiary’s treatment.</h2>
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

      <label>
        Payment method
        <select value={form.paymentMethod} onChange={updateField('paymentMethod')}>
          <option value="razorpay">Razorpay / UPI / Card</option>
          <option value="bank_transfer">Direct bank transfer</option>
        </select>
      </label>

      {form.paymentMethod === 'bank_transfer' ? (
        <label>
          UTR / transaction ID
          <input
            value={form.utrNumber}
            onChange={updateField('utrNumber')}
            placeholder="Enter UTR after transfer"
          />
        </label>
      ) : null}

      <button className="primary-button" disabled={submitting}>
        {submitting ? 'Processing...' : 'Continue donation'}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
      <p className="form-note">
        Successful payments are recorded in Appwrite. Bank transfer details are shown separately for
        a direct beneficiary payment path.
      </p>
    </form>
  );
}
