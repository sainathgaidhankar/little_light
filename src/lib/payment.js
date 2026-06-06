import { functions, ids } from './appwrite';
import { campaignDefaults } from './campaign';

export const createDonationExecution = async (payload) => {
  if (!ids.createDonationFunctionId) {
    return { ok: false, message: 'Donation function is not configured.' };
  }

  try {
    const execution = await functions.createExecution({
      functionId: ids.createDonationFunctionId,
      method: 'POST',
      async: false,
      body: JSON.stringify(payload),
    });

    const responseBody = execution.responseBody ? JSON.parse(execution.responseBody) : {};
    return responseBody;
  } catch (err) {
    return {
      ok: false,
      message: err?.message || 'Donation function request failed.',
    };
  }
};

export const buildUpiIntentUrl = ({ amount, note }) => {
  const upiId = campaignDefaults.bankUpiId;
  if (!upiId) return '';

  const params = new URLSearchParams({
    pa: upiId,
    pn:
      campaignDefaults.bankAccountHolderName ||
      campaignDefaults.beneficiaryName ||
      campaignDefaults.bankAccountName ||
      campaignDefaults.title,
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

export const openUpiPayment = async ({ donor, amount, onSuccess, onError, onPending }) => {
  const url = buildUpiIntentUrl({
    amount,
    note: donor?.name
      ? `Donation from ${donor.name}`
      : `Donation for ${campaignDefaults.beneficiaryName}`,
  });

  if (!url) {
    onError?.('UPI ID is not configured.');
    return;
  }

  const result = await createDonationExecution({
    donor,
    amount,
    currency: campaignDefaults.currency,
    paymentMethod: 'upi',
    gateway: 'upi',
    transactionRef: `upi-${Date.now()}`,
    status: 'pending',
  });

  if (!result.ok) {
    onError?.(result.message || 'Could not start the donation.');
    return;
  }

  onPending?.('Opening your UPI app. Complete the payment there and share the UTR if needed.');
  window.location.href = url;
  onSuccess?.(result);
};
