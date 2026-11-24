/**
 * Game Paused has letters only. Periods would fall back to Monocraft's italic
 * dot, which sits loose in display type, so they render as a solid pixel block
 * instead. The real "." stays in the DOM (transparent) for copy/paste and
 * screen readers.
 */
export function PixelText({ children }) {
  return String(children)
    .split(/(\.)/)
    .map((part, i) =>
      part === '.' ? (
        <span className="pdot" key={i}>
          .
        </span>
      ) : (
        part
      ),
    )
}
