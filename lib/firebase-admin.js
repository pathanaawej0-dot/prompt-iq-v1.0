import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Parse the private key properly
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Remove quotes if they exist and replace escaped newlines
  privateKey = privateKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
  
  // Debug logging (remove in production)
  console.log('Private key length:', privateKey?.length);
  console.log('Private key starts with:', privateKey?.substring(0, 50));
  console.log('Private key ends with:', privateKey?.substring(privateKey.length - 50));
}

const firebaseAdminConfig = {
  credential: cert({
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: privateKey || process.env.FIREBASE_PRIVATE_KEY,
  }),
};

// Initialize Firebase Admin
const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Initialize Admin services
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

export default adminApp;
