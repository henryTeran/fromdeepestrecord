import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER,
  appId: import.meta.env.VITE_FB_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const fx = getFunctions(app, "us-central1");

if (import.meta.env.DEV) {
  // IMPORTANT : utiliser l’IP 127.0.0.1 (et pas localhost) pour éviter certains soucis de cookies/CORS
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(fx, "127.0.0.1", 5001);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");      // si tu lances Auth
  connectStorageEmulator(storage, "127.0.0.1", 9199);      // si tu lances Storage
}