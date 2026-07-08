import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Populate these from your Firebase console (Project settings > General)
// and store them in a `.env.local` file (see .env.example) for local dev,
// or as GitHub Actions / hosting-provider secrets for deployed builds —
// never commit real keys to source control.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// If a secret was never set (e.g. a GitHub Actions secret name was
// mistyped), initializeApp() throws and — without this guard — the whole
// app crashes to a blank white screen with only a console error to go on.
// `isFirebaseConfigured` lets App.jsx show a clear on-screen message instead.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

let app, auth, db, googleProvider;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Diagnostic only — helps catch a mismatch between the project this
  // build is actually talking to and whatever project the Firestore
  // rules got deployed to (e.g. a typo'd VITE_FIREBASE_PROJECT_ID
  // GitHub secret used by deploy-firestore-rules.yml). Compare this
  // value against Project settings > General > Project ID in the
  // Firebase console you're checking rules in.
  console.info("[Finma] Connected Firebase project:", firebaseConfig.projectId);
}

export { app, auth, db, googleProvider };

// Suggested Firestore layout:
// users/{uid}                          -> profile, primaryCurrency, language
// users/{uid}/ledgerEntries/{entryId}  -> individual income/expense transactions
// users/{uid}/monthlyCycles/{yyyy-mm}  -> { openingBalance, closingBalance, closedAt }
