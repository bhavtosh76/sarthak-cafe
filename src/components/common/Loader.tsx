/** Full-page / section loading indicator. */
export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
