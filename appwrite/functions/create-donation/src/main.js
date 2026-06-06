import crypto from 'node:crypto';
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

async function createRazorpayOrder({ donorName, amount, currency }) {
  const apiKey = process.env.RAZORPAY_KEY_ID;
  const apiSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Razorpay credentials are not configured.');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { donorName },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || 'Could not create order.');
  }

  return {
    ok: true,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
  };
}

export default async ({ req, res, log, error }) => {
  try {
    const body = readBody(req);

    if (body.action === 'create-order') {
      const donorName = String(body.donorName || '').trim();
      const amount = Number(body.amount || 0);
      const currency = String(body.currency || 'INR').toUpperCase();

      if (!donorName || !amount) {
        return json(res, { ok: false, message: 'Missing donor name or amount.' }, 400);
      }

      const order = await createRazorpayOrder({ donorName, amount, currency });
      return json(res, order);
    }

    const {
      donor,
      amount,
      currency = 'INR',
      paymentMethod = 'razorpay',
      gateway = 'razorpay',
      gatewayPaymentId = '',
      gatewayOrderId = '',
      gatewaySignature = '',
      transactionRef = '',
      utrNumber = '',
      status = 'completed',
    } = body;

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
        phone: donor.phone || '',
        createdFrom: donor.createdFrom || 'website',
      });
    }

    const hasRazorpayVerification =
      gateway !== 'razorpay'
        ? true
        : Boolean(
            gatewaySignature &&
              gatewayOrderId &&
              gatewayPaymentId &&
              crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(`${gatewayOrderId}|${gatewayPaymentId}`)
                .digest('hex') === gatewaySignature
          );

    if (!hasRazorpayVerification) {
      return json(res, { ok: false, message: 'Payment verification failed.' }, 400);
    }

    const donation = await databases.createDocument(databaseId, donationsCollectionId, ID.unique(), {
      donorId: donorRecord.$id,
      donorName: donor.name,
      amount: Number(amount),
      currency,
      paymentMethod,
      gateway,
      gatewayPaymentId,
      gatewayOrderId,
      gatewaySignature,
      transactionRef,
      utrNumber,
      status,
      createdAtISO: new Date().toISOString(),
    });

    log(`Donation recorded: ${donation.$id}`);
    return json(res, { ok: true, donationId: donation.$id, donorId: donorRecord.$id });
  } catch (err) {
    error(String(err?.message || err));
    return json(res, { ok: false, message: 'Failed to create donation.' }, 500);
  }
};
