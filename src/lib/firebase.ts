import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "dev-api-key",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "deepestrecords.firebaseapp.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "deepestrecords",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "deepestrecords.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID || "dev-app-id",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const fx = getFunctions(app, "us-central1");
export const auth = getAuth(app);
export const storage = getStorage(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(fx, "127.0.0.1", 5001);
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
  } catch {}
  try {
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  } catch {}
}
