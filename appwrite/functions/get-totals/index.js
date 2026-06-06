import { Client, Databases, Query } from 'node-appwrite';

const json = (res, payload, statusCode = 200) =>
  res.json(payload, statusCode, {
    'Content-Type': 'application/json',
  });

export default async ({ req, res, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY || req.headers['x-appwrite-key'] || '');

    const databases = new Databases(client);
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const donationsCollectionId = process.env.APPWRITE_DONATIONS_COLLECTION_ID;
    const updatesCollectionId = process.env.APPWRITE_UPDATES_COLLECTION_ID;

    const donations = await databases.listDocuments(databaseId, donationsCollectionId, [
      Query.limit(100),
    ]);
    const visibleUpdates = await databases.listDocuments(databaseId, updatesCollectionId, [
      Query.equal('visible', true),
      Query.orderDesc('createdAtISO'),
      Query.limit(20),
    ]);

    const totals = donations.documents.reduce(
      (acc, donation) => {
        const amount = Number(donation.amount || 0);
        if (donation.status === 'verified' || donation.status === 'completed') {
          acc.raised += amount;
          acc.count += 1;
        }
        return acc;
      },
      { raised: 0, count: 0 }
    );

    return json(res, {
      ok: true,
      raised: totals.raised,
      donations: totals.count,
      updates: visibleUpdates.documents,
      recentDonations: donations.documents
        .filter((donation) => donation.status === 'verified' || donation.status === 'completed')
        .slice(0, 5),
    });
  } catch (err) {
    error(String(err?.message || err));
    return json(res, { ok: false, message: 'Failed to fetch totals.' }, 500);
  }
};
