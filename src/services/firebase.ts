import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, updateDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = 'all_ears_firebase_custom_config';

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved Firebase config:', e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

// Check for env or saved custom config
const envConfig: FirebaseCustomConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const saved = getSavedFirebaseConfig();
export const activeConfig = saved || (envConfig.apiKey ? envConfig : null);
export const isLiveFirebaseConfigured = Boolean(activeConfig && activeConfig.apiKey && activeConfig.projectId);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isLiveFirebaseConfigured && activeConfig) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    console.log('Firebase initialized with Project ID:', activeConfig.projectId);
  } catch (err) {
    console.warn('Firebase initialization error, fallback to client-side reactive store:', err);
    appInstance = null;
  }
}

export {
  appInstance as firebaseApp,
  authInstance as firebaseAuth,
  dbInstance as firestoreDb,
  storageInstance as firebaseStorage,
};
