import { campaignDefaults } from '../lib/campaign';

export default function BankDetails() {
  const fields = [
    { label: 'Bank name', value: campaignDefaults.bankName },
    { label: 'Account holder name', value: campaignDefaults.bankAccountHolderName },
    { label: 'Account number', value: campaignDefaults.bankAccountNumber },
    { label: 'IFSC', value: campaignDefaults.bankIfsc },
  ];

  return (
    <section className="panel bank-panel" id="bank-transfer-details">
      <div className="section-heading">
        <span className="eyebrow">Fallback option</span>
        <h2>Direct bank transfer details.</h2>
      </div>

      <div className="bank-grid">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="meta-label">{field.label}</p>
            <strong>{field.value || 'Add in Appwrite'}</strong>
          </div>
        ))}
      </div>

      {campaignDefaults.bankUpiId ? (
        <div className="bank-upi-row">
          <p className="meta-label">UPI ID</p>
          <strong>{campaignDefaults.bankUpiId}</strong>
        </div>
      ) : null}
    </section>
  );
}
