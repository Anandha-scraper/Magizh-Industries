const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (process.env.K_SERVICE || process.env.FIREBASE_CONFIG) {
      // Use Application Default Credentials for Firebase App Hosting
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase initialized with Application Default Credentials (App Hosting/Cloud Run)');
    } 
    // Local development with service account file
    else {
      let serviceAccount;
      try {
        serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase initialized with service account file (Local Development)');
      } catch (error) {
        // Fallback to default credentials
        console.log('serviceAccountKey.json not found, using default credentials');
        admin.initializeApp();
        console.log('Firebase initialized with default credentials');
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

const db = admin.firestore();
const auth = admin.auth();

console.log('Firebase Connected Successfully');

module.exports = { admin, db, auth };
