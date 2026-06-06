# Donation Payment Issue

## Goal
Build a donation flow where a donor can enter an amount, pay successfully, and have the donation stored in Appwrite.

## Current Symptom
- Clicking `Donate now` shows `Failed to fetch` in the UI.
- In Appwrite, the `create-donation` function executions page shows **zero executions**.
- This means the browser request is not reaching the function at all, or it is being blocked before Appwrite logs an execution.

## What Exists

### Appwrite resources
- Project ID: `6a23e8b600393c746741`
- Database ID: `6a23ea6300133df926cb`
- Collections:
  - `donors`
  - `donations`
  - `updates`
  - `campaigns`
- Storage bucket ID: `6a23f70e0003a7793e6c`

### Appwrite functions
- `create-donation`
  - Function ID: `6a240294003c40e59b09`
- `get-totals`
  - Function ID: `6a240aba001c79f46fc3`

### Frontend env currently used
```ini
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6a23e8b600393c746741
VITE_APPWRITE_DATABASE_ID=6a23ea6300133df926cb
VITE_APPWRITE_DONORS_COLLECTION_ID=donors
VITE_APPWRITE_DONATIONS_COLLECTION_ID=donations
VITE_APPWRITE_UPDATES_COLLECTION_ID=updates
VITE_APPWRITE_STORAGE_BUCKET_ID=6a23f70e0003a7793e6c
VITE_APPWRITE_CREATE_DONATION_FUNCTION_ID=6a240294003c40e59b09
VITE_APPWRITE_GET_TOTALS_FUNCTION_ID=6a240aba001c79f46fc3
VITE_APPWRITE_ADMIN_EMAIL=sainathgaidhankar@gmail.com
VITE_CAMPAIGN_TARGET_AMOUNT=2000000
VITE_CAMPAIGN_CURRENCY=INR
VITE_CAMPAIGN_TITLE=Help Baby little Recover
VITE_CAMPAIGN_BENEFICIARY_NAME=SHEHBAAZ SHAIKH
VITE_BANK_ACCOUNT_NAME=STATE BANK OF INDIA
VITE_BANK_ACCOUNT_NUMBER=20147810747
VITE_BANK_IFSC=SBIN0001861
VITE_BANK_UPI_ID=shehbaazansari336@oksbi
VITE_RAZORPAY_KEY_ID=rzp_test_SyK41el1Dju9hx
VITE_RAZORPAY_LOGO_URL=
```

## Current Frontend Flow

File: [src/components/DonationForm.jsx](./src/components/DonationForm.jsx)

- Donor enters:
  - name
  - amount
- Clicks `Donate now`
- The app calls Appwrite function `create-donation`
- The function is expected to:
  1. create a Razorpay order when `action === 'create-order'`
  2. verify the payment after Razorpay success
  3. save the donation in Appwrite

## Current Backend Function Logic

File: [appwrite/functions/create-donation/index.js](./appwrite/functions/create-donation/index.js)

The function currently does both:
- order creation via Razorpay API when `body.action === 'create-order'`
- donation verification/storage when payment data is sent back

## Verified Facts From Screenshots
- `create-donation` exists.
- `create-donation` shows no executions.
- The browser displays `Failed to fetch`.

## Things That Have Already Been Checked
- Function exists in Appwrite.
- Function execute access was set to `Any`.
- Function secrets/API keys were entered in Appwrite function settings.
- Frontend `.env` has the function ID values.

## Important Code Paths To Inspect

### Frontend function call
File: [src/lib/payment.js](./src/lib/payment.js)

The frontend uses:
```js
functions.createExecution({
  functionId: ids.createDonationFunctionId,
  method: 'POST',
  async: false,
  body: JSON.stringify(payload),
});
```

### Appwrite client setup
File: [src/lib/appwrite.js](./src/lib/appwrite.js)

The app uses:
```js
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6a23e8b600393c746741
```

## Open Questions
- Why is the browser request not reaching the function?
- Is the Appwrite Web platform/origin configured correctly for the current local dev host?
- Is the browser request being blocked before the function runs?
- Is there a mismatch between the frontend origin and the Appwrite platform configuration?

## Expected Outcome
- Clicking `Donate now` should open a valid checkout flow.
- A successful payment should be written to Appwrite.
- Public totals should update from the stored donation record.

## Notes For Another AI
Please focus on the reason the browser request to Appwrite is failing before the function execution is created. Do not assume the payment gateway is the primary issue unless the function call itself is confirmed working.
