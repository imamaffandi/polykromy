// Loads the low-poly nature kit (src/assets/webgl/*.glb) as plain CPU arrays.
// The models are tiny, untextured and colour-by-material, so instead of
// creating one GPU mesh per primitive we bake each model to flat triangle
// lists tagged with a print "ink" code, then merge them into a handful of
// layer meshes (see island.js). That keeps the whole island at 3 draw calls.

const urls = import.meta.glob('../assets/webgl/*.glb', { eager: true, query: '?url', import: 'default' })

/**
 * Material name → print treatment (read by printProgram.js):
 * 0 solid ink · 1 textured ink (foliage) · 2 deep ink (earth, wood)
 * 3 paper (stone) · 4 accent paper (flowers, autumn leaves) · 5 water
 */
const INK = {
  grass: 0,
  leafsGreen: 1,
  leafsDark: 1,
  leafsFall: 4,
  dirt: 2,
  dirtDark: 2,
  wood: 2,
  woodBark: 2,
  woodBarkDark: 2,
  woodBirch: 3,
  stone: 3,
  stoneDark: 3,
  _defaultMat: 3,
  colorWhite: 3,
  colorPurple: 4,
  colorYellow: 4,
  colorRed: 4,
  water: 5,
}

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
const ARRAYS = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }

function rotateByQuat([x, y, z], [qx, qy, qz, qw]) {
  // v' = v + 2w(q×v) + 2q×(q×v)
  const cx = qy * z - qz * y
  const cy = qz * x - qx * z
  const cz = qx * y - qy * x
  return [
    x + 2 * (qw * cx + qy * cz - qz * cy),
    y + 2 * (qw * cy + qz * cx - qx * cz),
    z + 2 * (qw * cz + qx * cy - qy * cx),
  ]
}

/** Parses a binary glTF into one de-indexed triangle list with per-vertex ink codes. */
export function parseGLB(buffer) {
  const view = new DataView(buffer)
  const jsonLength = view.getUint32(12, true)
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength)))
  const binStart = 20 + jsonLength + 8

  const read = (index) => {
    const acc = json.accessors[index]
    const bv = json.bufferViews[acc.bufferView]
    const Ctor = ARRAYS[acc.componentType]
    const start = binStart + (bv.byteOffset || 0) + (acc.byteOffset || 0)
    return new Ctor(buffer.slice(start, start + acc.count * COMPONENTS[acc.type] * Ctor.BYTES_PER_ELEMENT))
  }

  const pos = []
  const nor = []
  const ink = []

  json.nodes.forEach((node) => {
    if (node.mesh === undefined) return
    const t = node.translation || [0, 0, 0]
    const r = node.rotation || [0, 0, 0, 1]
    const s = node.scale || [1, 1, 1]

    json.meshes[node.mesh].primitives.forEach((prim) => {
      const p = read(prim.attributes.POSITION)
      const n = read(prim.attributes.NORMAL)
      const idx = prim.indices !== undefined ? read(prim.indices) : null
      const name = json.materials?.[prim.material]?.name ?? '_defaultMat'
      const code = INK[name] ?? 3
      const count = idx ? idx.length : p.length / 3

      for (let i = 0; i < count; i++) {
        const v = idx ? idx[i] : i
        const vp = rotateByQuat([p[v * 3] * s[0], p[v * 3 + 1] * s[1], p[v * 3 + 2] * s[2]], r)
        const vn = rotateByQuat([n[v * 3], n[v * 3 + 1], n[v * 3 + 2]], r)
        pos.push(vp[0] + t[0], vp[1] + t[1], vp[2] + t[2])
        nor.push(...vn)
        ink.push(code)
      }
    })
  })

  return { pos, nor, ink }
}

/** Fetches and bakes the named models in parallel. Reports progress 0..1. */
export async function loadKit(names, onProgress = () => {}) {
  let done = 0
  const entries = await Promise.all(
    names.map(async (name) => {
      const url = urls[`../assets/webgl/${name}.glb`]
      if (!url) throw new Error(`Missing model: ${name}`)
      const res = await fetch(url)
      const model = parseGLB(await res.arrayBuffer())
      onProgress(++done / names.length)
      return [name, model]
    }),
  )
  return Object.fromEntries(entries)
}
