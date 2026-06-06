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
        <h1>Choose a payment path and support directly.</h1>
        <p className="body-copy">
          Razorpay handles the secure checkout, while bank transfer gives donors a direct fallback
          for manual support. All completed payments are logged in Appwrite.
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
