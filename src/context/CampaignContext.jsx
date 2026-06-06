import { createContext, useContext, useEffect, useState } from 'react';
import { databases, functions, ids, realtime, storage, Query, appwriteEnabled } from '../lib/appwrite';
import {
  campaignDefaults,
  emptyDocuments,
  emptyUpdates,
  formatCurrency,
} from '../lib/campaign';

const CampaignContext = createContext(null);

async function fetchTotals() {
  if (appwriteEnabled && ids.getTotalsFunctionId) {
    try {
      const execution = await functions.createExecution({
        functionId: ids.getTotalsFunctionId,
        method: 'GET',
        async: false,
      });
      if (execution.responseBody) {
        const parsed = JSON.parse(execution.responseBody);
        if (parsed?.ok) return parsed;
      }
    } catch {
      // fall through to collection-based fallback
    }
  }

  if (
    !appwriteEnabled ||
    !ids.databaseId ||
    !ids.donationsCollectionId ||
    !ids.updatesCollectionId
  ) {
    return {
      ok: true,
      raised: 0,
      donations: 0,
      updates: [],
      recentDonations: [],
    };
  }

  const documents = await databases.listDocuments(ids.databaseId, ids.donationsCollectionId, [
    Query.orderDesc('createdAtISO'),
    Query.limit(100),
  ]);

  const updates = await databases.listDocuments(ids.databaseId, ids.updatesCollectionId, [
    Query.equal('visible', true),
    Query.orderDesc('createdAtISO'),
    Query.limit(20),
  ]);

  const totals = documents.documents.reduce(
    (acc, item) => {
      if (item.status === 'verified' || item.status === 'completed') {
        acc.raised += Number(item.amount || 0);
        acc.donations += 1;
      }
      return acc;
    },
    { raised: 0, donations: 0 }
  );

  return {
    ok: true,
      raised: totals.raised,
      donations: totals.donations,
      updates: updates.documents,
      recentDonations: documents.documents
        .filter((item) => item.status === 'verified' || item.status === 'completed')
        .slice(0, 5),
      donationHistory: documents.documents.filter(
        (item) => item.status === 'verified' || item.status === 'completed'
      ),
    };
  }

const buildDocumentsFromUpdates = (updateRows) => {
  if (!ids.bucketId) return emptyDocuments;

  const docs = updateRows.flatMap((update) =>
    (update.documentIds || []).map((fileId, index) => ({
      $id: fileId,
      name: update.documentNames?.[index] || `Document ${index + 1}`,
      mimeType: 'application/pdf',
      url: storage.getFileView(ids.bucketId, fileId),
    }))
  );

  return docs.length ? docs : emptyDocuments;
};

export function CampaignProvider({ children }) {
  const [campaign, setCampaign] = useState({
    ...campaignDefaults,
    raised: 0,
    donations: 0,
    progress: 0,
  });
  const [updates, setUpdates] = useState(emptyUpdates);
  const [documents, setDocuments] = useState(emptyDocuments);
  const [recentDonations, setRecentDonations] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshCampaign = async () => {
    setError('');
    try {
      const data = await fetchTotals();
      const raised = Number(data.raised || 0);
      const progress = Math.min(
        100,
        Math.round((raised / Number(campaignDefaults.targetAmount || 1)) * 100)
      );

      setCampaign({
        ...campaignDefaults,
        raised,
        donations: Number(data.donations || 0),
        progress,
      });
      const visibleUpdates = data.updates?.length ? data.updates : emptyUpdates;
      setUpdates(visibleUpdates);
      setRecentDonations(data.recentDonations || []);
      setDonationHistory(data.donationHistory || []);
      setDocuments(buildDocumentsFromUpdates(visibleUpdates));
    } catch (err) {
      setError(err?.message || 'Failed to load campaign data.');
      setCampaign((current) => ({ ...current, progress: current.progress || 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCampaign();
  }, []);

  useEffect(() => {
    if (!appwriteEnabled || !ids.databaseId || !ids.donationsCollectionId) return undefined;

    const donationChannel = `databases.${ids.databaseId}.collections.${ids.donationsCollectionId}.documents`;
    const updateChannel = `databases.${ids.databaseId}.collections.${ids.updatesCollectionId}.documents`;

    let mounted = true;

    const subscribe = async () => {
      const handle = await realtime.subscribe([donationChannel, updateChannel], () => {
        if (mounted) refreshCampaign();
      });

      return handle;
    };

    let subscription;
    subscribe().then((handle) => {
      subscription = handle;
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const value = {
    campaign,
    updates,
    documents,
    recentDonations,
    donationHistory,
    loading,
    error,
    refreshCampaign,
    formatRaised: formatCurrency(campaign.raised, campaign.currency),
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export const useCampaign = () => useContext(CampaignContext);
