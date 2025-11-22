import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN ,
  projectId: import.meta.env.VITE_FB_PROJECT_ID ,
  storageBucket: import.meta.env.VITE_FB_STORAGE ,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER,
  appId: import.meta.env.VITE_FB_APP_ID ,
};

if (!firebaseConfig.apiKey) throw new Error("Missing VITE_FB_API_KEY");
if (!firebaseConfig.appId?.startsWith("1:")) throw new Error("VITE_FB_APP_ID looks wrong");
if (!firebaseConfig.authDomain?.endsWith(".firebaseapp.com")) throw new Error("VITE_FB_AUTH_DOMAIN looks wrong");


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
