import { useMemo, useState } from 'react'
import { CATEGORIES, categoryLabel } from '../../constants'
import { isFirebaseConfigured } from '../../config/firebase'
import { useToast } from '../../context/ToastContext'
import { useMenu } from '../../hooks/useMenu'
import { removeMenuItem, updateMenuItem } from '../../services/menu.service'
import { formatCurrency } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Loader } from '../../components/common/Loader'
import { VegBadge } from '../../components/common/VegBadge'
import { MenuItemForm } from './MenuItemForm'
import type { MenuItem } from '../../types'
import styles from './MenuManagerPage.module.css'

export default function MenuManagerPage() {
  const { data: items, loading, error, reload } = useMenu()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  // undefined = dialog closed, null = "create" mode, value = edit mode
  const [dialogItem, setDialogItem] = useState<MenuItem | null | undefined>(undefined)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const readOnly = !isFirebaseConfigured

  const filtered = useMemo(() => {
    if (!items) return []
    const term = search.trim().toLowerCase()
    return items.filter(
      (item) =>
        (category === 'all' || item.category === category) &&
        (!term || item.name.toLowerCase().includes(term)),
    )
  }, [items, search, category])

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true)
    try {
      await action()
      showToast(successMessage, 'success')
      await reload()
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : 'Action failed', 'error')
    } finally {
      setBusy(false)
      setConfirmingId(null)
    }
  }

  const handleDelete = (item: MenuItem) =>
    run(async () => {
      await removeMenuItem(item)
    }, `"${item.name}" deleted`)

  const toggleAvailability = (item: MenuItem) =>
    run(async () => {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable })
    }, item.isAvailable ? 'Marked unavailable' : 'Marked available')

  const toggleFeatured = (item: MenuItem) =>
    run(async () => {
      await updateMenuItem(item.id, { isFeatured: !item.isFeatured })
    }, item.isFeatured ? 'Removed from home page' : 'Added to home page')

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Menu management</h1>
          <p>{items ? `${items.length} items` : 'Loading…'}</p>
        </div>
        <Button
          onClick={() => setDialogItem(null)}
          disabled={readOnly || busy}
          ariaLabel="Add a new menu item"
        >
          + Add item
        </Button>
      </header>

      {readOnly && (
        <div className={styles.notice}>
          <strong>Demo mode:</strong> menu below is local demo data. Add Firebase keys to{' '}
          <code>.env</code> to create, edit and upload real images.
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search items…"
          aria-label="Search menu items"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.emoji} {entry.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loader label="Loading menu…" />}

      {!loading && error && (
        <EmptyState emoji="😵" title="Could not load menu" message={error}>
          <Button onClick={() => void reload()}>Try again</Button>
        </EmptyState>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState emoji="🔍" title="No items found" message="Try a different search or category." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <article key={item.id} className={styles.card}>
              <img src={item.imageUrl} alt="" className={styles.thumb} loading="lazy" />

              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3>
                    <VegBadge isVeg={item.isVeg} /> {item.name}
                  </h3>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>

                <p className={styles.meta}>
                  {categoryLabel(item.category)} · ★ {item.rating.toFixed(1)} · {item.prepTimeMins}{' '}
                  min
                </p>

                <div className={styles.tags}>
                  <button
                    type="button"
                    className={item.isAvailable ? styles.tagOn : styles.tagOff}
                    onClick={() => void toggleAvailability(item)}
                    disabled={readOnly || busy}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                  <button
                    type="button"
                    className={item.isFeatured ? styles.tagOn : styles.tagOff}
                    onClick={() => void toggleFeatured(item)}
                    disabled={readOnly || busy}
                  >
                    {item.isFeatured ? '★ Featured' : 'Feature'}
                  </button>
                </div>

                <div className={styles.cardActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDialogItem(item)}
                    disabled={readOnly || busy}
                  >
                    Edit
                  </Button>
                  {confirmingId === item.id ? (
                    <button
                      type="button"
                      className={styles.confirmDelete}
                      onClick={() => void handleDelete(item)}
                      disabled={busy}
                    >
                      Confirm delete?
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.delete}
                      onClick={() => setConfirmingId(item.id)}
                      disabled={readOnly || busy}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {dialogItem !== undefined && (
        <MenuItemForm
          item={dialogItem}
          onClose={() => setDialogItem(undefined)}
          onSaved={() => void reload()}
        />
      )}
    </div>
  )
}
