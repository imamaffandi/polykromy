import { Geometry } from 'ogl'
import { MARK_CENTER, MARK_PATHS } from '../brand/mark'

const SVG_NS = 'http://www.w3.org/2000/svg'
const SAMPLES_PER_PATH = 140

// Sample each SVG path outline into a polygon using the browser's path engine.
function samplePaths(paths) {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.style.position = 'absolute'
  document.body.appendChild(svg)

  const polygons = paths.map((d) => {
    const el = document.createElementNS(SVG_NS, 'path')
    el.setAttribute('d', d)
    svg.appendChild(el)
    const total = el.getTotalLength()
    const pts = []
    for (let i = 0; i < SAMPLES_PER_PATH; i++) {
      const p = el.getPointAtLength((i / SAMPLES_PER_PATH) * total)
      pts.push([p.x, p.y])
    }
    return pts
  })

  svg.remove()
  return polygons
}

// Area-weighted centroid: every piece of the mark is star-shaped around it,
// so a triangle fan from this point triangulates the cap correctly.
function centroid(pts) {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % pts.length]
    const cross = x0 * y1 - x1 * y0
    a += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  a *= 0.5
  return [cx / (6 * a), cy / (6 * a), a]
}

/**
 * Builds a flat-shaded extruded geometry of the Polykromy mark.
 * Output is centred on the origin, roughly 2.3 units wide.
 */
export function createMarkGeometry(gl, { depth = 0.34, scale = 1 / 290 } = {}) {
  const polygons = samplePaths(MARK_PATHS)
  const pos = []
  const nor = []
  const half = depth / 2

  const toWorld = ([x, y]) => [(x - MARK_CENTER.x) * scale, -(y - MARK_CENTER.y) * scale]

  const pushTri = (a, b, c, n) => {
    pos.push(...a, ...b, ...c)
    nor.push(...n, ...n, ...n)
  }

  polygons.forEach((poly) => {
    const [cx, cy, area] = centroid(poly)
    // SVG y-down + flip means winding is mirrored; normalise to CCW in world space.
    const pts = (area > 0 ? [...poly].reverse() : poly).map(toWorld)
    const c = toWorld([cx, cy])
    const n = pts.length

    for (let i = 0; i < n; i++) {
      const p0 = pts[i]
      const p1 = pts[(i + 1) % n]

      // caps
      pushTri([c[0], c[1], half], [p0[0], p0[1], half], [p1[0], p1[1], half], [0, 0, 1])
      pushTri([c[0], c[1], -half], [p1[0], p1[1], -half], [p0[0], p0[1], -half], [0, 0, -1])

      // side wall with an outward-facing flat normal
      const ex = p1[0] - p0[0]
      const ey = p1[1] - p0[1]
      const len = Math.hypot(ex, ey) || 1
      const sn = [ey / len, -ex / len, 0]
      const a = [p0[0], p0[1], half]
      const b = [p1[0], p1[1], half]
      const d = [p0[0], p0[1], -half]
      const e = [p1[0], p1[1], -half]
      pushTri(a, d, b, sn)
      pushTri(b, d, e, sn)
    }
  })

  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nor) },
  })
}
