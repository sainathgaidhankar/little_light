# Appwrite Setup Guide

This project uses Appwrite for:

- donor records
- donation transactions
- fundraiser updates
- hospital documents
- campaign metadata

Follow the steps below in order.

## 1) Create The Appwrite Project

1. Open the Appwrite Console.
2. Create a new project.
3. Copy the project endpoint. It usually looks like `https://cloud.appwrite.io/v1`.
4. Keep the project open, because you will need the Project ID, Database ID, Collection IDs, Bucket ID, and Function IDs.

## 2) Create The Database

Create one database:

- Database name: `donation_db`

After creating it, copy the Database ID.

## 3) Create The Collections

Create these 4 collections inside the same database:

- `donors`
- `donations`
- `updates`
- `campaigns`

After creating each collection, copy its Collection ID.

## 4) Add Fields To Each Collection

### donors

Add these fields:

- `name` - string
- `phone` - string, optional
- `createdFrom` - string, optional

### donations

Add these fields:

- `donorId` - string
- `donorName` - string
- `amount` - number
- `currency` - string
- `paymentMethod` - string
- `gateway` - string
- `gatewayPaymentId` - string, optional
- `gatewayOrderId` - string, optional
- `gatewaySignature` - string, optional
- `utrNumber` - string, optional
- `status` - string
- `transactionRef` - string, optional
- `createdAtISO` - string

Recommended status values:

- `pending`
- `verified`
- `rejected`
- `completed`

### updates

Add these fields:

- `title` - string
- `body` - string
- `category` - string
- `visible` - boolean
- `spentAmount` - number, optional
- `documentIds` - array, optional
- `documentNames` - array, optional
- `createdAtISO` - string

### campaigns

Add these fields:

- `title` - string
- `targetAmount` - number
- `currency` - string
- `hospitalName` - string, optional
- `hospitalAddress` - string, optional
- `hospitalMapUrl` - string, optional
- `patientContactNumber` - string, optional
- `active` - boolean

Use `campaigns` for the static fundraiser details. Use `donations` as the transaction ledger. Only count verified donations in the public total.

## 5) Create The Storage Bucket

Create one storage bucket:

- Bucket name: `hospital_docs`

Use it for:

- hospital bills
- doctor letters
- proof screenshots

Copy the Bucket ID after creating it.

Permissions:

- read: public if you want documents visible on the site
- write: admin only

## 6) Create The Functions

Create these 2 Appwrite Functions:

- `create-donation`
- `get-totals`

Copy both Function IDs after creation.

### Function environment variables

Set these in the Appwrite Function settings:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_DONORS_COLLECTION_ID=your_donors_collection_id
APPWRITE_DONATIONS_COLLECTION_ID=your_donations_collection_id
APPWRITE_UPDATES_COLLECTION_ID=your_updates_collection_id
APPWRITE_STORAGE_BUCKET_ID=your_bucket_id
APPWRITE_API_KEY=your_appwrite_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 7) Fill The Frontend `.env`

Create a `.env` file in the project root and paste this:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_DONORS_COLLECTION_ID=your_donors_collection_id
VITE_APPWRITE_DONATIONS_COLLECTION_ID=your_donations_collection_id
VITE_APPWRITE_UPDATES_COLLECTION_ID=your_updates_collection_id
VITE_APPWRITE_STORAGE_BUCKET_ID=your_bucket_id
VITE_APPWRITE_CREATE_DONATION_FUNCTION_ID=your_create_donation_function_id
VITE_APPWRITE_GET_TOTALS_FUNCTION_ID=your_get_totals_function_id
VITE_APPWRITE_ADMIN_EMAIL=your_admin_email@example.com
VITE_CAMPAIGN_TARGET_AMOUNT=2000000
VITE_CAMPAIGN_CURRENCY=INR
VITE_CAMPAIGN_TITLE=Help Save My Premature Newborn Baby Fighting For Life In NICU
VITE_CAMPAIGN_BENEFICIARY_NAME=Baby of Shehbaaz Imam Sahab
VITE_BANK_ACCOUNT_NAME=SHEHBAAZ SHAIKH
VITE_BANK_ACCOUNT_NUMBER=20147810747
VITE_BANK_IFSC=SBIN0001861
VITE_BANK_NAME=STATE BANK OF INDIA
VITE_BANK_UPI_ID=
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_LOGO_URL=
VITE_HOSPITAL_MAP_URL=https://maps.app.goo.gl/a5fSWeRyebtsck4j6?g_st=aw
VITE_PATIENT_CONTACT_NUMBER=+91 70454 93868
```

## 8) Donation Flow

### Razorpay donations

1. Donor enters name and amount.
2. Razorpay opens.
3. After payment succeeds, the gateway payment ID, order ID, and signature are stored.
4. Donation status should be `completed` or `verified` only after verification.

### Bank transfer donations

1. Donor enters name and amount.
2. Donor makes the bank or UPI transfer.
3. Donor enters the UTR / transaction ID.
4. Donor uploads a screenshot if you add that field.
5. Admin verifies the payment manually.
6. Only then set `status = verified`.

Important:

- Do not count donations just because the form was submitted.
- Only verified donations should be included in the public `total raised`.

## 9) Permissions Checklist

- `donors`: create through function/admin only, read restricted
- `donations`: create through function/admin only, read public if needed for donor list and totals
- `updates`: public read, admin write
- `campaigns`: public read, admin write
- storage bucket: public read only if you want documents visible, admin write

## 10) Final Order To Set Up

1. Create the project.
2. Create the database.
3. Create the collections.
4. Add the fields.
5. Set permissions.
6. Create the storage bucket.
7. Create the functions.
8. Paste IDs into `.env`.
9. Run the frontend.

## 11) What This App Reads From Appwrite

- donor names and donation amounts from `donations`
- campaign target and hospital details from `campaigns`
- updates from `updates`
- bill and letter files from Storage

## 12) If You Want The Safest Setup

Use this rule:

- `bank_transfer` stays `pending` until admin verifies it
- `razorpay` is marked `verified` after gateway verification
- public totals sum only verified donations
