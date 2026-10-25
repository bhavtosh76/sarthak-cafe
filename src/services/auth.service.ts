import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../config/firebase'

/** Signs the cafe owner/admin in (Firebase Console > Authentication users). */
export function signInAdmin(email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth(), email, password).then(() => undefined)
}

export function signOutAdmin(): Promise<void> {
  return signOut(auth())
}

/** Subscribes to auth state changes; returns an unsubscribe function. */
export function watchAuth(onUser: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth(), onUser)
}
