import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Populate these from your Firebase console (Project settings > General)
// and store them in a `.env.local` file (see .env.example) for local dev,
// or as GitHub Actions / hosting-provider secrets for deployed builds —
// never commit real keys to source control.
const firebaseConfig = {
  apiKey: "AIzaSyAvS0v-vEljDOnCIE1ODSUWaIuUyeyLUk0",
  authDomain: "device-streaming-ab9e2bb3.firebaseapp.com",
  projectId: "device-streaming-ab9e2bb3",
  storageBucket: "device-streaming-ab9e2bb3.firebasestorage.app",
  messagingSenderId: "255765040075",
  appId: "1:255765040075:web:ad54aa4d1a99928a36444e"
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
}

export { app, auth, db, googleProvider };

// Suggested Firestore layout:
// users/{uid}                          -> profile, primaryCurrency, language
// users/{uid}/ledgerEntries/{entryId}  -> individual income/expense transactions
// users/{uid}/monthlyCycles/{yyyy-mm}  -> { openingBalance, closingBalance, closedAt }
