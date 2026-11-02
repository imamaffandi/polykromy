import { useLayoutEffect } from 'react'

/** Scales a single-line element's font-size so it spans its parent's full width. */
export function useFitText(ref) {
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const fit = () => {
      el.style.fontSize = '100px'
      const natural = el.scrollWidth
      const styles = getComputedStyle(parent)
      const available = parent.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
      if (natural > 0) el.style.fontSize = `${(100 * available) / natural}px`
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [ref])
}
