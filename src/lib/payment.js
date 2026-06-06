import { functions, ids } from './appwrite';
import { campaignDefaults } from './campaign';

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const createDonationExecution = async (payload) => {
  if (!ids.createDonationFunctionId) {
    return { ok: false, message: 'Donation function is not configured.' };
  }

  const execution = await functions.createExecution({
    functionId: ids.createDonationFunctionId,
    method: 'POST',
    async: false,
    body: JSON.stringify(payload),
  });

  const responseBody = execution.responseBody ? JSON.parse(execution.responseBody) : {};
  return responseBody;
};

export const buildUpiIntentUrl = ({ amount, note }) => {
  const upiId = campaignDefaults.bankUpiId;
  if (!upiId) return '';

  const params = new URLSearchParams({
    pa: upiId,
    pn: campaignDefaults.bankAccountName || campaignDefaults.beneficiaryName || campaignDefaults.title,
    am: String(Number(amount || 0)),
    cu: campaignDefaults.currency,
  });

  if (note) params.set('tn', note);

  return `upi://pay?${params.toString()}`;
};

export const openUpiIntent = ({ amount, donorName, onError }) => {
  const url = buildUpiIntentUrl({
    amount,
    note: donorName ? `Donation from ${donorName}` : `Donation for ${campaignDefaults.beneficiaryName}`,
  });

  if (!url) {
    onError?.('UPI ID is not configured.');
    return false;
  }

  window.location.href = url;
  return true;
};

export const openRazorpayCheckout = async ({
  donor,
  amount,
  onSuccess,
  onError,
  onPending,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError?.('Razorpay checkout could not be loaded.');
    return;
  }

  if (!campaignDefaults.razorpayKeyId) {
    onError?.('Razorpay key is missing from environment.');
    return;
  }

  const options = {
    key: campaignDefaults.razorpayKeyId,
    amount: Math.round(Number(amount) * 100),
    currency: campaignDefaults.currency,
    name: campaignDefaults.title,
    description: `Donation for ${campaignDefaults.beneficiaryName}`,
    image: campaignDefaults.razorpayLogo || undefined,
    prefill: {
      name: donor.name,
    },
    theme: {
      color: '#0f766e',
    },
    handler: async (response) => {
      try {
        const result = await createDonationExecution({
          donor,
          amount,
          currency: campaignDefaults.currency,
          paymentMethod: 'razorpay',
          gateway: 'razorpay',
          gatewayPaymentId: response.razorpay_payment_id,
          gatewayOrderId: response.razorpay_order_id,
          gatewaySignature: response.razorpay_signature,
          utrNumber: response.razorpay_payment_id,
          status: 'completed',
        });

        if (!result.ok) {
          onError?.(result.message || 'Donation log failed.');
          return;
        }

        onSuccess?.(result);
      } catch (err) {
        onError?.(err?.message || 'Payment record could not be saved.');
      }
    },
    modal: {
      ondismiss: () => onPending?.('Payment window closed before completion.'),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
