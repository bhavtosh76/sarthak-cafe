import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface Props {
  emoji?: string
  title: string
  message?: string
  children?: ReactNode
}

/** Friendly empty / no-results placeholder. */
export function EmptyState({ emoji = '🍽️', title, message, children }: Props) {
  return (
    <div className={styles.empty}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  )
}
