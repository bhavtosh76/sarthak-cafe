import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { CATEGORIES } from '../../constants'
import { useToast } from '../../context/ToastContext'
import { addMenuItem, updateMenuItem } from '../../services/menu.service'
import { deleteImage, uploadMenuImage } from '../../services/storage.service'
import { Button } from '../../components/common/Button'
import type { MenuItem, MenuItemInput } from '../../types'
import styles from './MenuItemForm.module.css'

interface Props {
  /** Existing item for edit mode, `null` for create mode */
  item: MenuItem | null
  onClose: () => void
  onSaved: () => void
}

/** Bundled artwork used when no photo is chosen (or Storage is unavailable). */
const PLACEHOLDER_IMAGE = '/menu-images/placeholder.svg'

interface FormState {
  name: string
  description: string
  price: string
  category: string
  isVeg: boolean
  isAvailable: boolean
  isFeatured: boolean
  rating: string
  prepTimeMins: string
}

const toFormState = (item: MenuItem | null): FormState => ({
  name: item?.name ?? '',
  description: item?.description ?? '',
  price: item ? String(item.price) : '',
  category: item?.category ?? CATEGORIES[0].id,
  isVeg: item?.isVeg ?? true,
  isAvailable: item?.isAvailable ?? true,
  isFeatured: item?.isFeatured ?? false,
  rating: item ? String(item.rating) : '4.5',
  prepTimeMins: item ? String(item.prepTimeMins) : '20',
})

/**
 * Create/edit dialog for a menu item. Handles the Firebase Storage image
 * upload (with progress) before writing the Firestore document.
 */
export function MenuItemForm({ item, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(() => toFormState(item))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(item?.imageUrl ?? '')
  const [progress, setProgress] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Close on Escape.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Revoke temporary object URLs when leaving the dialog.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageFile(file)
    if (file) {
      objectUrlRef.current = URL.createObjectURL(file)
      setPreviewUrl(objectUrlRef.current)
    } else {
      setPreviewUrl(item?.imageUrl ?? '')
    }
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const found: Partial<Record<keyof FormState, string>> = {}
    if (form.name.trim().length < 2) found.name = 'Name is required'
    if (form.description.trim().length < 5) found.description = 'Add a short description'
    const price = Number(form.price)
    if (!Number.isFinite(price) || price <= 0) found.price = 'Enter a valid price'
    const rating = Number(form.rating)
    if (rating < 0 || rating > 5) found.rating = 'Rating must be 0–5'
    const prep = Number(form.prepTimeMins)
    if (!Number.isFinite(prep) || prep < 1) found.prepTimeMins = 'Prep time must be ≥ 1 min'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      let imageUrl = item?.imageUrl ?? ''
      let imagePath = item?.imagePath ?? ''

      if (imageFile) {
        setProgress(0)
        try {
          const uploaded = await uploadMenuImage(imageFile, setProgress)
          imageUrl = uploaded.imageUrl
          imagePath = uploaded.imagePath
          // Replacing an old photo — clean it up from Storage.
          if (item?.imagePath && item.imagePath !== imagePath) {
            await deleteImage(item.imagePath).catch(() => undefined)
          }
        } catch {
          // Storage is unavailable (e.g. the Blaze plan is not enabled) — the
          // item must still be saveable, so fall back to the bundled artwork.
          showToast('Photo upload skipped — Firebase Storage is not enabled', 'error')
          imageUrl = imageUrl || PLACEHOLDER_IMAGE
        }
      }

      if (!imageUrl) imageUrl = PLACEHOLDER_IMAGE

      const payload: MenuItemInput = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        isVeg: form.isVeg,
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        rating: Number(form.rating),
        prepTimeMins: Number(form.prepTimeMins),
        imageUrl,
        imagePath,
      }

      if (item) await updateMenuItem(item.id, payload)
      else await addMenuItem(payload)

      showToast(item ? 'Menu item updated' : 'Menu item added', 'success')
      onSaved()
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save the item', 'error')
    } finally {
      setSaving(false)
      setProgress(null)
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={item ? 'Edit menu item' : 'Add menu item'}
        ref={dialogRef}
      >
        <header className={styles.head}>
          <h2>{item ? 'Edit item' : 'Add new item'}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className={styles.close}>
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.imageRow}>
            <div className={styles.preview}>
              {previewUrl ? (
                <img src={previewUrl} alt="Dish preview" />
              ) : (
                <span aria-hidden="true">🖼️</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="item-photo">Photo {item ? '(leave unchanged to keep)' : ''}</label>
              <input id="item-photo" type="file" accept="image/*" onChange={onFileChange} />
              <small className={styles.hint}>
                Optional · uploaded to Firebase Storage (needs the Blaze plan) · JPG/PNG/WEBP · max 5
                MB
              </small>
              {progress !== null && (
                <div className={styles.progress} aria-label={`Upload ${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          </div>

          <div className={styles.grid}>
            <div className="field">
              <label htmlFor="item-name">Name</label>
              <input
                id="item-name"
                type="text"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="e.g. Paneer Tikka"
              />
              {errors.name && <span className="fieldError">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="item-category">Category</label>
              <select
                id="item-category"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="item-price">Price (₹)</label>
              <input
                id="item-price"
                type="number"
                min={1}
                value={form.price}
                onChange={(event) => update('price', event.target.value)}
                placeholder="199"
              />
              {errors.price && <span className="fieldError">{errors.price}</span>}
            </div>

            <div className="field">
              <label htmlFor="item-rating">Rating (0–5)</label>
              <input
                id="item-rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(event) => update('rating', event.target.value)}
              />
              {errors.rating && <span className="fieldError">{errors.rating}</span>}
            </div>

            <div className="field">
              <label htmlFor="item-prep">Prep time (min)</label>
              <input
                id="item-prep"
                type="number"
                min={1}
                value={form.prepTimeMins}
                onChange={(event) => update('prepTimeMins', event.target.value)}
              />
              {errors.prepTimeMins && <span className="fieldError">{errors.prepTimeMins}</span>}
            </div>

            <div className="field">
              <label htmlFor="item-veg">Food type</label>
              <select
                id="item-veg"
                value={form.isVeg ? 'veg' : 'nonveg'}
                onChange={(event) => update('isVeg', event.target.value === 'veg')}
              >
                <option value="veg">🟢 Vegetarian</option>
                <option value="nonveg">🔴 Non-vegetarian</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="item-desc">Description</label>
            <textarea
              id="item-desc"
              rows={2}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="What makes it tasty?"
            />
            {errors.description && <span className="fieldError">{errors.description}</span>}
          </div>

          <div className={styles.toggles}>
            <label>
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) => update('isAvailable', event.target.checked)}
              />
              Available for ordering
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => update('isFeatured', event.target.checked)}
              />
              Show on home page
            </label>
          </div>

          <footer className={styles.footer}>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving
                ? progress !== null
                  ? `Uploading ${progress}%`
                  : 'Saving…'
                : item
                  ? 'Save changes'
                  : 'Add item'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}
