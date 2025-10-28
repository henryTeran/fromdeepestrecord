import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "dev-api-key",
  authDomain: "deepestrecords.firebaseapp.com",
  projectId: "deepestrecords",
  storageBucket: "deepestrecords.appspot.com",
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
  try { connectAuthEmulator(auth, "http://127.0.0.1:9099"); } catch {}
  try { connectStorageEmulator(storage, "127.0.0.1", 9199); } catch {}
}
