// Public (client-side) Firebase Auth configuration.
// This is NOT a secret, but you must set it to your Firebase project's Web API key.
//
// How to find it:
// Firebase Console → Project settings → General → Your apps (Web app) → Web API Key
export const FIREBASE_WEB_API_KEY = 'AIzaSyB8OZ1kue301-MvR4PP1-na_BQVXgUrUc4';

// Your Firebase project id (from `.firebaserc`).
export const FIREBASE_PROJECT_ID = 'gl-labs-angular';

// Region where the Cloud Function is deployed.
export const FIREBASE_FUNCTIONS_REGION = 'us-central1';

// Staff login mode:
// - 'password': FREE (Firebase Auth email/password). User types "admin", we map internally to an email.
// - 'customToken': requires Cloud Functions (Blaze plan) to verify username/password server-side.
export const STAFF_LOGIN_MODE: 'password' | 'customToken' = 'password';

// Only used in 'password' mode.
// The UI will still ask for "Username", not email.
export const STAFF_USERNAME_EMAIL_DOMAIN = 'galaxylabsusa.com';

