import BankDetails from '../components/BankDetails';

export default function ContactPage() {
  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Contact</span>
        <h1>Questions, receipts, and coordination.</h1>
        <p className="body-copy">
          Reach out for payment confirmation, document requests, or campaign transparency questions.
        </p>
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Support</span>
            <h2>Contact details</h2>
          </div>
          <div className="contact-grid">
            <div>
              <p className="meta-label">Email</p>
              <strong>sainathgaidhankar@gmail.com</strong>
            </div>
            <div>
              <p className="meta-label">Phone</p>
              <strong>+91 8867671005</strong>
            </div>
            <div>
              <p className="meta-label">Hours</p>
              <strong>9:00 AM to 7:00 PM IST</strong>
            </div>
          </div>
        </section>

        <BankDetails />
      </div>
    </div>
  );
}
