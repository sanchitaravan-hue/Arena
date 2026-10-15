import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const getInitialConfig = () => {
  const localSaved = localStorage.getItem('arena_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved Firebase config from localStorage', e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyASiuG-B7uSoPdXpS9nFFV4di1ytymCbqc',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'arena-f789d.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'arena-f789d',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'arena-f789d.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '281486241670',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:281486241670:web:dbd70b79912ad67941c607',
  };
};

export let firebaseConfig = getInitialConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let app = null;
let auth = null;
let db = null;
let storage = null;

export const initFirebase = (configToUse = firebaseConfig) => {
  if (configToUse?.apiKey && configToUse?.projectId && configToUse.apiKey !== 'YOUR_FIREBASE_API_KEY') {
    try {
      if (getApps().length > 0) {
        app = getApps()[0];
      } else {
        app = initializeApp(configToUse);
      }
      auth = getAuth(app);
      db = getFirestore(app);
      try {
        storage = getStorage(app);
      } catch (err) {
        console.warn('Storage optional init:', err);
      }
      console.log('[ARENA Firebase] Connected to Cloud Firebase database successfully with projectId:', configToUse.projectId);
      return { success: true, app, auth, db, storage };
    } catch (error) {
      console.warn('[ARENA Firebase] Error initializing Firebase SDK, falling back to local storage mock mode:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.info('[ARENA Firebase] Operating in Mock / Local Storage Mode (Ready to connect when API keys are supplied).');
    return { success: false, mock: true };
  }
};

initFirebase(firebaseConfig);

export const saveFirebaseCustomConfig = (newConfig) => {
  try {
    localStorage.setItem('arena_firebase_config', JSON.stringify(newConfig));
    firebaseConfig = newConfig;
    const res = initFirebase(newConfig);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const clearFirebaseCustomConfig = () => {
  localStorage.removeItem('arena_firebase_config');
  window.location.reload();
};

export { app, auth, db, storage };
