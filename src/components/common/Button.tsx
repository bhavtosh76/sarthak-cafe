import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  /** Render the button as a router link (navigation + same visuals). */
  to?: string
  external?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * The single button primitive of the app — keeps every CTA visually
 * consistent. Pass `to` to make it navigate without leaving button semantics
 * of the design system.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  to,
  external = false,
  className = '',
  ariaLabel,
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to && !external) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  if (to && external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={classes} aria-label={ariaLabel}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
