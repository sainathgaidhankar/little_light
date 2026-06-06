import DonationForm from '../components/DonationForm';
import BankDetails from '../components/BankDetails';
import ProgressBar from '../components/ProgressBar';
import { useCampaign } from '../context/CampaignContext';

export default function DonatePage() {
  const { campaign } = useCampaign();

  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Donate</span>
        <h1>Donate in one tap using UPI, PhonePe, Google Pay, or Razorpay.</h1>
        <p className="body-copy">
          Enter your name and amount, then choose the fastest payment method. UPI apps open
          directly, Razorpay stays available for secure checkout, and bank details remain as a
          fallback.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
          <BankDetails />
        </div>
      </div>
    </div>
  );
}
