import { useMemo, useState } from 'react';
import { campaignDefaults } from '../lib/campaign';
import { createDonationExecution, openUpiIntent } from '../lib/payment';

const quickAmounts = [500, 1000, 2500, 5000];
const paymentMethods = [
  {
    id: 'upi',
    title: 'UPI',
    description: 'Open PhonePe, Google Pay, Paytm, BHIM, or another UPI app.',
    accent: 'method-primary',
  },
  {
    id: 'bank',
    title: 'Direct bank',
    description: 'Use account number and IFSC to transfer from your bank app.',
  },
  {
    id: 'netbanking',
    title: 'Net banking',
    description: 'Use your bank website or app to transfer the amount.',
  },
  {
    id: 'razorpay',
    title: 'Razorpay',
    description: 'Optional gateway checkout if you enable it later.',
    disabled: true,
  },
];

const upiApps = [
  'PhonePe',
  'Google Pay',
  'Paytm',
  'BHIM',
  'Other UPI app',
];

const initialState = {
  name: '',
  amount: '',
};

export default function DonationForm({ onComplete }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [showUpiApps, setShowUpiApps] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const selectedAmount = useMemo(() => Number(form.amount || 0), [form.amount]);

  const recordPendingDonation = async (method) => {
    const result = await createDonationExecution({
      donor: {
        name: form.name,
        createdFrom: method,
      },
      amount: selectedAmount,
      currency: campaignDefaults.currency,
      paymentMethod: method,
      gateway: method,
      transactionRef: `${method}-${Date.now()}`,
      status: 'pending',
    });

    if (!result.ok) {
      throw new Error(result.message || 'Could not start the donation.');
    }

    return result;
  };

  const handleMethodSelect = async (method) => {
    setSubmitting(true);
    setStatus('');

    try {
      if (!form.name || !selectedAmount) {
        throw new Error('Please enter your name and donation amount.');
      }

      if (method === 'upi') {
        const pending = await recordPendingDonation('upi');
        setShowMethods(false);
        setShowUpiApps(true);
        setStatus('Choose a UPI app to continue.');
        onComplete?.(pending);
        return;
      }

      if (method === 'bank' || method === 'netbanking') {
        const pending = await recordPendingDonation(method);
        setShowMethods(false);
        setStatus(
          method === 'bank'
            ? 'Open the bank transfer details and complete the payment.'
            : 'Use your bank app or website to complete the transfer.'
        );
        document.getElementById('bank-transfer-details')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        onComplete?.(pending);
        return;
      }

      if (method === 'razorpay') {
        setShowMethods(false);
        setStatus('Razorpay is optional. Enable it later if you want gateway checkout.');
        return;
      }

      throw new Error('Please choose a payment method.');
    } catch (err) {
      setStatus(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        className="panel donation-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name || !selectedAmount) {
            setStatus('Please enter your name and donation amount.');
            return;
          }
          setShowMethods(true);
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
          After you click Donate now, choose UPI, bank transfer, net banking, or Razorpay.
        </p>
      </form>

      {showMethods ? (
        <div className="payment-modal-backdrop" role="dialog" aria-modal="true">
          <div className="payment-modal">
            <button
              type="button"
              className="ghost-button modal-close"
              onClick={() => setShowMethods(false)}
            >
              Close
            </button>
            <div className="section-heading">
              <span className="eyebrow">Choose payment</span>
              <h2>Select how you want to pay.</h2>
            </div>
            <div className="donation-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`method-card ${method.accent || ''}`}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={submitting || method.disabled}
                >
                  <strong>{method.title}</strong>
                  <span>{method.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showUpiApps ? (
        <div className="payment-modal-backdrop" role="dialog" aria-modal="true">
          <div className="payment-modal">
            <button
              type="button"
              className="ghost-button modal-close"
              onClick={() => setShowUpiApps(false)}
            >
              Close
            </button>
            <div className="section-heading">
              <span className="eyebrow">UPI apps</span>
              <h2>Choose the app you want to use.</h2>
            </div>
            <div className="upi-app-grid">
              {upiApps.map((appName) => (
                <button
                  key={appName}
                  type="button"
                  className="method-card modal-app"
                  onClick={() => {
                    const opened = openUpiIntent({
                      amount: selectedAmount,
                      donorName: form.name,
                      onError: (message) => setStatus(message),
                    });
                    if (opened) {
                      setStatus(`Opening ${appName}. Complete payment in the app.`);
                      setShowUpiApps(false);
                    }
                  }}
                >
                  <strong>{appName}</strong>
                  <span>Open via UPI</span>
                </button>
              ))}
            </div>
            <p className="form-note">
              On Android, the phone will show the installed UPI apps. The exact list depends on the
              device.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
