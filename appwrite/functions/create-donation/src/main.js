import { Client, Databases, ID, Query } from 'node-appwrite';

const json = (res, payload, statusCode = 200) =>
  res.json(payload, statusCode, {
    'Content-Type': 'application/json',
  });

const readBody = (req) => {
  if (req.bodyJson) return req.bodyJson;
  if (!req.body) return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
};

export default async ({ req, res, log, error }) => {
  try {
    const body = readBody(req);
    const donor = body.donor || {};
    const amount = Number(body.amount || 0);
    const currency = String(body.currency || 'INR').toUpperCase();
    const paymentMethod = String(body.paymentMethod || 'upi');
    const gateway = String(body.gateway || 'upi');
    const transactionRef = String(body.transactionRef || '');
    const utrNumber = String(body.utrNumber || '');
    const status = String(body.status || 'pending');

    if (!donor?.name || !amount) {
      return json(res, { ok: false, message: 'Missing required donation fields.' }, 400);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY || req.headers['x-appwrite-key'] || '');

    const databases = new Databases(client);
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const donorsCollectionId = process.env.APPWRITE_DONORS_COLLECTION_ID;
    const donationsCollectionId = process.env.APPWRITE_DONATIONS_COLLECTION_ID;

    let donorRecord = null;
    const existingDonors = await databases.listDocuments(databaseId, donorsCollectionId, [
      Query.equal('name', donor.name),
      Query.limit(1),
    ]);

    if (existingDonors.total > 0) {
      donorRecord = existingDonors.documents[0];
    } else {
      donorRecord = await databases.createDocument(databaseId, donorsCollectionId, ID.unique(), {
        name: donor.name,
        phone: donor.phone || donor.contact || '',
      });
    }

    const donation = await databases.createDocument(databaseId, donationsCollectionId, ID.unique(), {
      donorId: donorRecord.$id,
      donorName: donor.name,
      amount: Number(amount),
      currency,
      paymentMethod,
      gateway,
      gatewayPaymentId: String(body.gatewayPaymentId || ''),
      gatewayOrderId: String(body.gatewayOrderId || ''),
      gatewaySignature: String(body.gatewaySignature || ''),
      transactionRef,
      utrNumber,
      status,
      createdAtISO: new Date().toISOString(),
    });

    log(`Donation recorded: ${donation.$id}`);
    return json(res, { ok: true, donationId: donation.$id, donorId: donorRecord.$id });
  } catch (err) {
    error(String(err?.message || err));
    return json(res, { ok: false, message: err?.message || 'Failed to create donation.' }, 500);
  }
};
