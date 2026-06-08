import { createContext, useContext, useEffect, useState } from 'react';
import { functions, ids, realtime, storage, appwriteEnabled } from '../lib/appwrite';
import {
  campaignDefaults,
  emptyDocuments,
  emptyUpdates,
  daysSincePosted,
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
      // fall through to a safe empty response; the public site should not read
      // private Appwrite collections directly.
    }
  }

  return {
    ok: true,
    raised: 0,
    donations: 0,
    updates: [],
    recentDonations: [],
    donationHistory: [],
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
    daysSincePosted: daysSincePosted(campaignDefaults.campaignPostedDate, 0),
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
      const daysSincePostedCount = daysSincePosted(campaignDefaults.campaignPostedDate, 0);

      setCampaign({
        ...campaignDefaults,
        raised,
        donations: Number(data.donations || 0),
        progress,
        daysSincePosted: daysSincePostedCount,
      });
      const visibleUpdates = data.updates?.length ? data.updates : emptyUpdates;
      setUpdates(visibleUpdates);
      setRecentDonations(data.recentDonations || []);
      setDonationHistory(data.donationHistory || []);
      setDocuments(buildDocumentsFromUpdates(visibleUpdates));
    } catch (err) {
      setError(err?.message || 'Failed to load campaign data.');
      setCampaign((current) => ({
        ...current,
        progress: current.progress || 0,
        daysSincePosted:
          current.daysSincePosted ?? daysSincePosted(campaignDefaults.campaignPostedDate, 0),
      }));
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
