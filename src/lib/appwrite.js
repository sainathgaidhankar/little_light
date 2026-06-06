import { Client, Account, Databases, Storage, Functions, Realtime, ID, Query } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const appwriteEnabled = Boolean(endpoint && projectId);

export const appwriteClient = new Client();

if (appwriteEnabled) {
  appwriteClient.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);
export const functions = new Functions(appwriteClient);
export const realtime = new Realtime(appwriteClient);

export { ID, Query };

export const ids = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  donorsCollectionId: import.meta.env.VITE_APPWRITE_DONORS_COLLECTION_ID || '',
  donationsCollectionId: import.meta.env.VITE_APPWRITE_DONATIONS_COLLECTION_ID || '',
  updatesCollectionId: import.meta.env.VITE_APPWRITE_UPDATES_COLLECTION_ID || '',
  bucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || '',
  createDonationFunctionId: import.meta.env.VITE_APPWRITE_CREATE_DONATION_FUNCTION_ID || '',
  getTotalsFunctionId: import.meta.env.VITE_APPWRITE_GET_TOTALS_FUNCTION_ID || '',
  adminEmail: import.meta.env.VITE_APPWRITE_ADMIN_EMAIL || '',
};
