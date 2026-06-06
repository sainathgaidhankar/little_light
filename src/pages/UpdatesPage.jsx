import DocumentGallery from '../components/DocumentGallery';
import UpdateTimeline from '../components/UpdateTimeline';
import { useCampaign } from '../context/CampaignContext';

export default function UpdatesPage() {
  const { updates, documents } = useCampaign();

  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Updates</span>
        <h1>Public timeline of recovery and expenses.</h1>
        <p className="body-copy">
          Families and donors can review the treatment timeline, medical expenses, and uploaded
          documents without needing to request private updates.
        </p>
      </section>

      <UpdateTimeline updates={updates} />
      <DocumentGallery documents={documents} />
    </div>
  );
}
