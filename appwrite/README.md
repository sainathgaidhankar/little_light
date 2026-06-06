# Appwrite backend setup

Create these resources in your Appwrite project:

## Database

Create one database with three collections:

- `donors`
- `donations`
- `updates`
- `campaigns` optional but recommended for target amount and campaign metadata

## Suggested document fields

### donors

- `name` string
- `phone` string optional
- `createdFrom` string optional

### donations

- `donorId` string
- `donorName` string
- `amount` number
- `currency` string
- `paymentMethod` string
- `gateway` string
- `gatewayPaymentId` string optional
- `gatewayOrderId` string optional
- `gatewaySignature` string optional
- `utrNumber` string optional
- `status` string
- `transactionRef` string optional
- `createdAtISO` string

### campaigns

- `title` string
- `targetAmount` number
- `currency` string
- `hospitalName` string optional
- `hospitalAddress` string optional
- `hospitalMapUrl` string optional
- `patientContactNumber` string optional
- `active` boolean

Use `campaigns` for the static fundraising target and hospital metadata. Keep `donations` as the transaction ledger, and derive `total raised` from the sum of successful donation records so the public counter stays accurate.

### updates

- `title` string
- `body` string
- `category` string
- `visible` boolean
- `spentAmount` number optional
- `documentIds` array optional
- `documentNames` array optional
- `createdAtISO` string

## Permissions

- `donations`: create only through the function or admin, read for public if you want the progress bar to query directly.
- `updates`: create/update/delete for admin only, read for public.
- `donors`: create through the function or admin, read restricted.

## Storage

Create one bucket for hospital bills and doctor letters.

Suggested permissions:

- read for public if documents should be visible
- write only for admin

## Functions

Deploy the two function folders:

- `create-donation`
- `get-totals`

Set the following environment variables in the function settings:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_DONORS_COLLECTION_ID`
- `APPWRITE_DONATIONS_COLLECTION_ID`
- `APPWRITE_UPDATES_COLLECTION_ID`
- `APPWRITE_STORAGE_BUCKET_ID`
- `APPWRITE_API_KEY`

Allow `Any` execute access on the functions if they are called directly from the browser.

The donate flow uses a UPI intent, so the donor's installed UPI apps open on supported devices.
The donation is stored as `pending` and manually verified later with UTR or screenshot proof.
