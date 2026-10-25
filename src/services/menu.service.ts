import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../config/firebase'
import { CATEGORIES } from '../constants'
import type { MenuItem, MenuItemInput } from '../types'
import { withoutUndefined } from '../utils/firestore'
import { getDemoMenuItems } from './demoData'
import { deleteImage } from './storage.service'

const COLLECTION = 'menu'

/** Sorts menu items by the canonical category order, then alphabetically. */
function sortMenu(items: MenuItem[]): MenuItem[] {
  const order = new Map(CATEGORIES.map((c, i) => [c.id, i]))
  return [...items].sort((a, b) => {
    const ca = order.get(a.category) ?? CATEGORIES.length
    const cb = order.get(b.category) ?? CATEGORIES.length
    if (ca !== cb) return ca - cb
    return a.name.localeCompare(b.name)
  })
}

/**
 * Loads the full menu. Falls back to local demo data when Firebase keys are
 * not configured yet, so the UI is always previewable.
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (!isFirebaseConfigured) return sortMenu(getDemoMenuItems())

  const snapshot = await getDocs(collection(db(), COLLECTION))
  const items = snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      name: String(data.name ?? ''),
      description: String(data.description ?? ''),
      price: Number(data.price ?? 0),
      category: String(data.category ?? ''),
      isAvailable: data.isAvailable !== false,
      isFeatured: Boolean(data.isFeatured),
      isVeg: Boolean(data.isVeg),
      imageUrl: String(data.imageUrl ?? ''),
      imagePath: String(data.imagePath ?? ''),
      rating: Number(data.rating ?? 0),
      prepTimeMins: Number(data.prepTimeMins ?? 30),
      createdAt: data.createdAt ?? null,
    } satisfies MenuItem
  })
  return sortMenu(items)
}

/** Creates a menu item, using the given id (keeps seed ids stable). */
export async function addMenuItem(input: MenuItemInput, id?: string): Promise<string> {
  const target = id ?? doc(collection(db(), COLLECTION)).id
  await setDoc(doc(db(), COLLECTION, target), withoutUndefined({ ...input }))
  return target
}

export async function updateMenuItem(id: string, patch: Partial<MenuItemInput>): Promise<void> {
  await updateDoc(doc(db(), COLLECTION, id), withoutUndefined({ ...patch }))
}

/** Deletes the Firestore doc and its Storage image. */
export async function removeMenuItem(item: MenuItem): Promise<void> {
  await deleteDoc(doc(db(), COLLECTION, item.id))
  if (item.imagePath) await deleteImage(item.imagePath).catch(() => undefined)
}
