import { Geometry } from 'ogl'

/**
 * The floating island, composed from the kit on a 7×7 tile grid (x, z in -3..3).
 * Pieces are grouped into three layers so the story can build it bottom-up:
 * 0 ground (tiles, cliffs, rock base) · 1 stone (rocks, pedestal) · 2 flora.
 */
const HALF = 3

// deterministic PRNG so the island and its scatter are identical every load
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RIVER_X = 2 // the stream runs north-south down this column
const PATH = new Set(['-3,0', '-2,0', '-1,0'])

/** Hand-placed landmarks. Hotspot anchors in content/site.js sit on these. */
const LANDMARKS = [
  // stone layer
  { m: 'path_stoneCircle', x: 0, z: 0, s: 1.1, layer: 1 },
  { m: 'statue_block', x: 0, z: 0, s: 1.4, layer: 1 }, // the mark's pedestal
  { m: 'stone_tallA', x: -1.6, z: -1.4, s: 1.2, r: 0.5, layer: 1 }, // hotspot: model
  { m: 'rock_largeD', x: -2.4, z: -2.5, s: 1, r: 1.2, layer: 1 },
  { m: 'stone_tallI', x: -0.5, z: -2.6, s: 1, layer: 1 },
  { m: 'rock_tallJ', x: 2.9, z: -0.3, s: 1.1, layer: 1 },
  { m: 'stone_largeD', x: -2.6, z: 2.3, s: 0.8, r: 2.2, layer: 1 },
  { m: 'rock_smallG', x: 1.1, z: 1.4, s: 1, layer: 1 },
  { m: 'stone_smallTopA', x: -1.1, z: 1.2, s: 1, layer: 1 },
  { m: 'stone_smallFlatC', x: -0.6, z: 0.8, s: 1, r: 0.7, layer: 1 },
  { m: 'stone_smallFlatC', x: 0.8, z: -0.9, s: 1, r: 2.1, layer: 1 },
  { m: 'fence_simpleHigh', x: 3, z: 1, s: 1, r: Math.PI / 2, layer: 1 }, // hotspot: script
  { m: 'fence_simpleHigh', x: 3, z: 2, s: 1, r: Math.PI / 2, layer: 1 },
  { m: 'bed', x: 2.6, z: 2.6, s: 1.3, r: Math.PI / 2, layer: 1 },
  // flora layer
  { m: 'tree_tall', x: 1.4, z: -2.1, s: 1.1, layer: 2 }, // hotspot: animate
  { m: 'tree_pineTallB', x: -2.9, z: -2.9, s: 1.1, layer: 2 },
  { m: 'tree_pineTallA', x: -1.7, z: -2.9, s: 1, layer: 2 },
  { m: 'tree_pineGroundA', x: -3, z: -1.6, s: 1, layer: 2 },
  { m: 'tree_plateau', x: 3, z: -2.8, s: 1.1, layer: 2 },
  { m: 'tree_small', x: 0.4, z: -2.9, s: 1, layer: 2 },
  { m: 'tree_thin_fall', x: -2.8, z: 1.4, s: 1.1, r: 1, layer: 2 },
  { m: 'tree_pineRoundE', x: -1.4, z: 2.8, s: 1, layer: 2 },
  { m: 'tree_thin', x: 0.9, z: 2.9, s: 1, r: 2.4, layer: 2 },
  { m: 'tree_pineGroundA', x: 2.95, z: -1.6, s: 0.8, layer: 2 },
  { m: 'lily_large', x: RIVER_X, z: -1.1, s: 1.2, layer: 2 },
  { m: 'lily_small', x: RIVER_X - 0.1, z: 0.4, s: 1.2, layer: 2 },
  { m: 'lily_small', x: RIVER_X + 0.1, z: 2.3, s: 1.2, r: 2, layer: 2 },
]

const SCATTER_FILLERS = [
  'grass_large',
  'grass_leafs',
  'plant_bush',
  'plant_bushSmall',
  'flower_purpleC',
  'flower_yellowA',
]

export const KIT_MODELS = [
  ...new Set([
    'ground_grass',
    'ground_pathRocks',
    'ground_riverSide',
    'cliff_stone',
    'hanging_moss',
    ...LANDMARKS.map((l) => l.m),
    ...SCATTER_FILLERS,
  ]),
]

/** Top of the pedestal in island space, where the mark lands in chapter F. */
export const PEDESTAL_TOP = 0.4 * 1.4 - 0.05

function layout(rand) {
  const pieces = []
  const taken = new Set()
  const key = (x, z) => `${Math.round(x)},${Math.round(z)}`

  for (let x = -HALF; x <= HALF; x++) {
    for (let z = -HALF; z <= HALF; z++) {
      if (x === RIVER_X) {
        pieces.push({ m: 'ground_riverSide', x, z, r: Math.PI / 2, layer: 0 })
      } else if (PATH.has(`${x},${z}`)) {
        pieces.push({ m: 'ground_pathRocks', x, z, r: Math.PI / 2, layer: 0 })
      } else {
        pieces.push({ m: 'ground_grass', x, z, layer: 0 })
      }

      // two rows of cliff wall on each outward face, in deep ink
      const faces = []
      if (z === HALF) faces.push(0)
      if (x === HALF) faces.push(Math.PI / 2)
      if (z === -HALF) faces.push(Math.PI)
      if (x === -HALF) faces.push(-Math.PI / 2)
      faces.forEach((r) => {
        pieces.push({ m: 'cliff_stone', x, z, y: -1, r, layer: 0, ink: 2 })
        pieces.push({ m: 'cliff_stone', x, z, y: -2, r, layer: 0, ink: 2 })
        if (rand() < 0.35) pieces.push({ m: 'hanging_moss', x, z, y: -0.5, r, layer: 2 })
      })
    }
  }

  LANDMARKS.forEach((l) => {
    pieces.push(l)
    taken.add(key(l.x, l.z))
  })
  PATH.forEach((k) => taken.add(k))
  taken.add('0,0')

  // sprinkle small plants on free grass cells
  for (let x = -HALF; x <= HALF; x++) {
    for (let z = -HALF; z <= HALF; z++) {
      if (x === RIVER_X || taken.has(key(x, z))) continue
      const n = rand() < 0.75 ? 1 + Math.floor(rand() * 2) : 0
      for (let i = 0; i < n; i++) {
        pieces.push({
          m: SCATTER_FILLERS[Math.floor(rand() * SCATTER_FILLERS.length)],
          x: x + (rand() - 0.5) * 0.7,
          z: z + (rand() - 0.5) * 0.7,
          r: rand() * Math.PI * 2,
          s: 0.9 + rand() * 0.6,
          layer: 2,
        })
      }
    }
  }
  return pieces
}

/** Square two-tier rock base under the island, flat-shaded, deep ink. */
function baseRock() {
  const tiers = [
    [-2, 3.5, -3.3, 2.4],
    [-3.3, 2.4, -5.1, 0.55],
  ]
  const pos = []
  const nor = []
  tiers.forEach(([y0, h0, y1, h1]) => {
    const corners = (h, y) => [
      [-h, y, -h],
      [h, y, -h],
      [h, y, h],
      [-h, y, h],
    ]
    const top = corners(h0, y0)
    const bot = corners(h1, y1)
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4
      const a = top[i]
      const b = top[j]
      const c = bot[j]
      const d = bot[i]
      // face normal from two edges
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
      const len = Math.hypot(...n) || 1
      n = n.map((k) => k / len)
      if (n[0] * (a[0] + c[0]) + n[2] * (a[2] + c[2]) < 0) n = n.map((k) => -k) // face outward
      pos.push(...a, ...b, ...c, ...a, ...c, ...d)
      for (let k = 0; k < 6; k++) nor.push(...n)
    }
  })
  return { pos, nor, ink: new Array(pos.length / 3).fill(2) }
}

/**
 * Bakes the island into three OGL geometries. Every vertex carries its piece's
 * pivot, a scatter offset and a seed so the vertex shader can explode and
 * reassemble the island without any per-piece CPU work.
 */
export function buildIsland(gl, kit, { seed = 2026 } = {}) {
  const rand = mulberry32(seed)
  const layers = [0, 1, 2].map(() => ({ pos: [], nor: [], ink: [], pivot: [], scatter: [], seed: [] }))

  const pushPiece = (model, { x = 0, y = 0, z = 0, r = 0, s = 1, layer, ink }, pivotY) => {
    const L = layers[layer]
    const cos = Math.cos(r)
    const sin = Math.sin(r)
    // scatter: thrown outward and upward from the island centre
    const ang = Math.atan2(z, x) + (rand() - 0.5) * 1.4
    const dist = 1.5 + rand() * 4.5
    const sc = [Math.cos(ang) * dist, -1 + rand() * 4.5 + layer * 0.6, Math.sin(ang) * dist]
    const sd = rand()
    const pv = [x, y + pivotY * s, z]

    for (let i = 0; i < model.pos.length; i += 3) {
      const px = model.pos[i] * s
      const py = model.pos[i + 1] * s
      const pz = model.pos[i + 2] * s
      L.pos.push(px * cos + pz * sin + x, py + y, -px * sin + pz * cos + z)
      const nx = model.nor[i]
      const nz = model.nor[i + 2]
      L.nor.push(nx * cos + nz * sin, model.nor[i + 1], -nx * sin + nz * cos)
      L.ink.push(ink ?? model.ink[i / 3])
      L.pivot.push(...pv)
      L.scatter.push(...sc)
      L.seed.push(sd)
    }
  }

  layout(rand).forEach((piece) => pushPiece(kit[piece.m], piece, 0.3))
  // the rock base scatters as one big chunk
  pushPiece(baseRock(), { layer: 0 }, -3)

  return layers.map(
    (L) =>
      new Geometry(gl, {
        position: { size: 3, data: new Float32Array(L.pos) },
        normal: { size: 3, data: new Float32Array(L.nor) },
        aInk: { size: 1, data: new Float32Array(L.ink) },
        aPivot: { size: 3, data: new Float32Array(L.pivot) },
        aScatter: { size: 3, data: new Float32Array(L.scatter) },
        aSeed: { size: 1, data: new Float32Array(L.seed) },
      }),
  )
}
