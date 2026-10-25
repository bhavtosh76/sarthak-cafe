import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { ContactMessage } from '../types'
import { withoutUndefined } from '../utils/firestore'

/** Stores a contact-form submission in Firestore (`messages` collection). */
export async function sendContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
  await addDoc(collection(db(), 'messages'), withoutUndefined({ ...message, createdAt: serverTimestamp() }))
}
