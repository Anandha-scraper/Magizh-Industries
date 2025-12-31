const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

// Try to load service account from file (for local development)
try {
  serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
} catch (error) {
  console.log('📝 serviceAccountKey.json not found, using default credentials');
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      // Local development with service account file
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase initialized with service account file');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Explicit environment variables (optional)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase initialized with environment variables');
    } else {
      // Cloud Functions or production - use default credentials
      admin.initializeApp();
      console.log('✅ Firebase initialized with default credentials (Cloud Functions)');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

const db = admin.firestore();
const auth = admin.auth();

console.log('🔥 Firebase Connected Successfully');

module.exports = { admin, db, auth };
