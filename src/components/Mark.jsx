import { MARK_PATHS, MARK_VIEWBOX } from '../brand/mark'

export function Mark({ className, title = 'Polykromy' }) {
  return (
    <svg className={className} viewBox={MARK_VIEWBOX} role="img" aria-label={title}>
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
    </svg>
  )
}
