import DonationForm from '../components/DonationForm';
import ProgressBar from '../components/ProgressBar';
import { useCampaign } from '../context/CampaignContext';

export default function DonatePage() {
  const { campaign } = useCampaign();

  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Donate</span>
        <h1>Choose a payment method.</h1>
        <p className="body-copy">
          Enter your name and amount, then choose UPI, net banking, or card. UPI opens the
          installed apps on supported phones, and desktop shows a QR code. Bank transfers are
          verified later through Appwrite.
        </p>
      </section>

      <div className="two-column-layout">
        <DonationForm />
        <div className="stack-column">
          <ProgressBar raised={campaign.raised} target={campaign.targetAmount} />
        </div>
      </div>
    </div>
  );
}
