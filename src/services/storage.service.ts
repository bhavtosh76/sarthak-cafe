import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../config/firebase'

export interface UploadedImage {
  /** Public URL stored on the menu item */
  imageUrl: string
  /** Storage path — keep it to replace/delete the image later */
  imagePath: string
}

/**
 * Uploads a menu photo to Firebase Storage with progress callbacks.
 * The file name is randomised so re-uploads never clash (important for the
 * HTTP cache used by Firebase Hosting).
 */
export function uploadMenuImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedImage> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `menu-images/${crypto.randomUUID()}.${extension}`
  const storageRef = ref(storage(), path)
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type })

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
        }
      },
      reject,
      async () => {
        const imageUrl = await getDownloadURL(task.snapshot.ref)
        resolve({ imageUrl, imagePath: path })
      },
    )
  })
}

/** Best-effort image delete (ignores "already deleted" errors). */
export async function deleteImage(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage(), path))
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code !== 'storage/object-not-found') throw error
  }
}
