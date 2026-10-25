import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../constants'
import { useDebounce } from '../hooks/useDebounce'
import { useMenu } from '../hooks/useMenu'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { Loader } from '../components/common/Loader'
import { MenuCard } from '../components/menu/MenuCard'
import type { MenuItem } from '../types'
import styles from './MenuPage.module.css'

/**
 * Menu listing with URL-backed search/category/veg filters — the state lives
 * in the query string so results are shareable and survive refreshes.
 */
export default function MenuPage() {
  const { data: items, loading, error, reload } = useMenu()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const activeCategory = params.get('category') ?? 'all'
  const vegOnly = params.get('veg') === '1'

  const [input, setInput] = useState(query)
  const debouncedInput = useDebounce(input, 350)

  // External navigation (hero search, category tiles) updates the box.
  useEffect(() => {
    setInput(query)
  }, [query])

  // Debounced typing updates the URL.
  useEffect(() => {
    if (debouncedInput === query) return
    const next = new URLSearchParams(params)
    if (debouncedInput.trim()) next.set('q', debouncedInput.trim())
    else next.delete('q')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setParams(next)
  }

  const filtered = useMemo<MenuItem[]>(() => {
    if (!items) return []
    let list = items
    if (activeCategory !== 'all') list = list.filter((i) => i.category === activeCategory)
    if (vegOnly) list = list.filter((i) => i.isVeg)
    const term = query.trim().toLowerCase()
    if (term) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.description.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term),
      )
    }
    return list
  }, [items, activeCategory, vegOnly, query])

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        items: filtered.filter((i) => i.category === category.id),
      })).filter((group) => group.items.length > 0),
    [filtered],
  )

  return (
    <div className="section">
      <div className="container">
        <header className={styles.head}>
          <div>
            <h1>Our Menu</h1>
            <p>{loading ? 'Loading… :)' : `${filtered.length} dishes waiting for you`}</p>
          </div>

          <div className={styles.searchBox}>
            <input
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search dishes…"
              aria-label="Search dishes"
            />
          </div>
        </header>

        <div className={styles.filters}>
          <div className={styles.pills} role="tablist" aria-label="Categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={`${styles.pill} ${activeCategory === 'all' ? styles.pillActive : ''}`}
              onClick={() => patchParams({ category: null })}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                className={`${styles.pill} ${activeCategory === category.id ? styles.pillActive : ''}`}
                onClick={() => patchParams({ category: category.id })}
              >
                <span aria-hidden="true">{category.emoji}</span> {category.label}
              </button>
            ))}
          </div>

          <label className={styles.vegToggle}>
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(event) => patchParams({ veg: event.target.checked ? '1' : null })}
            />
            <span className={styles.track}>
              <span className={styles.thumb} />
            </span>
            Veg only
          </label>
        </div>

        {loading && <Loader label="Plating dishes…" />}

        {!loading && error && (
          <EmptyState emoji="😵" title="Could not load the menu" message={error}>
            <Button onClick={() => void reload()}>Try again</Button>
          </EmptyState>
        )}

        {!loading && !error && groups.length === 0 && (
          <EmptyState
            emoji="🔍"
            title="No dishes found"
            message={`Nothing matches "${query}"${vegOnly ? ' (veg only)' : ''}. Try another search.`}
          >
            <Button variant="secondary" onClick={() => setParams(new URLSearchParams())}>
              Clear filters
            </Button>
          </EmptyState>
        )}

        {!loading &&
          !error &&
          groups.map((group) => (
            <section key={group.category.id} className={styles.group}>
              <h2 className={styles.groupTitle}>
                <span aria-hidden="true">{group.category.emoji}</span> {group.category.label}
                <span className={styles.count}>{group.items.length}</span>
              </h2>
              <div className={styles.grid}>
                {group.items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  )
}
