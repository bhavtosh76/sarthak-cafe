import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Firebase bootstrap.
 *
 * Config values come from `.env` (see `.env.example`). The app is written so
 * that it still boots without them: `isFirebaseConfigured` lets the UI show a
 * friendly setup notice, and services fall back to demo data / throw a
 * descriptive `FirebaseNotConfiguredError` instead of failing cryptically.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True when the `.env` file contains a complete Firebase config. */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Firebase is not configured. Copy .env.example to .env and fill in your Firebase project keys.',
    )
    this.name = 'FirebaseNotConfiguredError'
  }
}

let app: FirebaseApp | null = null

function requireApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new FirebaseNotConfiguredError()
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig)
  }
  return app
}

/** Firestore instance (throws a clear error when not configured). */
export const db = (): Firestore => getFirestore(requireApp())

/** Firebase Storage instance. */
export const storage = (): FirebaseStorage => getStorage(requireApp())

/** Firebase Auth instance. */
export const auth = (): Auth => getAuth(requireApp())
