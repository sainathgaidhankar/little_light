import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';
import { storage, databases, ids, ID } from '../lib/appwrite';

export default function AdminPage() {
  const { user, login, logout, isAdmin } = useAuth();
  const { refreshCampaign, updates } = useCampaign();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Medical update');
  const [visible, setVisible] = useState(true);
  const [spentAmount, setSpentAmount] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const submitLogin = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      setMessage('Admin session created.');
    } catch (err) {
      setMessage(err?.message || 'Login failed.');
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile || !ids.bucketId) return null;
    const file = await storage.createFile(ids.bucketId, ID.unique(), uploadFile);
    return { id: file.$id, name: file.name };
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!isAdmin) throw new Error('Admin access required.');

      const documentIds = [];
      const documentNames = [];
      const uploaded = await uploadDocument();
      if (uploaded) {
        documentIds.push(uploaded.id);
        documentNames.push(uploaded.name);
      }

      await databases.createDocument(ids.databaseId, ids.updatesCollectionId, ID.unique(), {
        title,
        body,
        category,
        visible,
        spentAmount: Number(spentAmount || 0),
        documentIds,
        documentNames,
        createdAtISO: new Date().toISOString(),
      });

      setTitle('');
      setBody('');
      setSpentAmount('');
      setUploadFile(null);
      setMessage('Update posted successfully.');
      await refreshCampaign();
    } catch (err) {
      setMessage(err?.message || 'Unable to post update.');
    }
  };

  if (!user) {
    return (
      <div className="page-stack">
        <section className="panel page-intro">
          <span className="eyebrow">Admin login</span>
          <h1>Sign in to manage updates and documents.</h1>
        </section>

        <form className="panel auth-form" onSubmit={submitLogin}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="Enter admin email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter admin password"
            />
          </label>
          <button className="primary-button">Login</button>
          {message ? <p className="status-message">{message}</p> : null}
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-stack">
        <section className="panel page-intro">
          <span className="eyebrow">Admin access</span>
          <h1>Logged in, but not authorized to post updates.</h1>
          <p className="body-copy">
            This account can still view the site, but Appwrite rules should restrict update and
            document posting to the campaign admin.
          </p>
          <button className="ghost-button" type="button" onClick={logout}>
            Logout
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <span className="eyebrow">Admin dashboard</span>
        <h1>Post transparent updates and upload documents.</h1>
        <p className="body-copy">Signed in as {user.email}</p>
        <button className="ghost-button" type="button" onClick={logout}>
          Logout
        </button>
      </section>

      <div className="two-column-layout">
        <form className="panel auth-form" onSubmit={submitUpdate}>
          <div className="section-heading">
            <span className="eyebrow">New update</span>
            <h2>Publish a medical or expense note.</h2>
          </div>

          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label>
            Body
            <textarea rows="6" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Medical update</option>
              <option>Transparency</option>
              <option>Expense report</option>
            </select>
          </label>

          <label>
            Spent amount
            <input
              type="number"
              min="0"
              step="100"
              value={spentAmount}
              onChange={(e) => setSpentAmount(e.target.value)}
            />
          </label>

          <label>
            Attach bill or doctor letter
            <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            Visible on public updates page
          </label>

          <button className="primary-button">Publish update</button>
          {message ? <p className="status-message">{message}</p> : null}
        </form>

        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">Recent updates</span>
            <h2>Published timeline entries</h2>
          </div>
          <div className="recent-list">
            {updates.map((item) => (
              <div className="recent-item" key={item.$id}>
                <strong>{item.title}</strong>
                <span>{item.category}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
