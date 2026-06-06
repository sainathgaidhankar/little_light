# Donation site

React frontend + Appwrite backend scaffold for a transparent medical donation campaign.

## What is included

- Public pages for `Home`, `Donate`, `Updates`, and `Contact`
- Donation form with `name`, `email`, `amount`, and payment method selection
- Razorpay checkout integration with bank-transfer fallback
- Appwrite-backed totals, updates, and file galleries
- Admin dashboard for posting updates and uploading hospital documents

## Setup

1. Copy `.env.example` to `.env` and fill in the Appwrite IDs and payment keys.
2. Install dependencies with `npm install`.
3. Create the Appwrite database, collections, and storage bucket described in `appwrite/README.md`.
4. Deploy the Appwrite functions in `appwrite/functions`.
5. Start the UI with `npm run dev`.

## Security notes

- Public read access is intended for campaign totals, updates, and transparency documents.
- Writes should be restricted to the Appwrite function API key or to admin-authenticated users.
- Production deployment should be served behind HTTPS so the payment flow always runs over SSL.
