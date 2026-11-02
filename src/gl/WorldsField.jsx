import { useEffect, useRef } from 'react'
import { Box, Cylinder, Mesh, Sphere, Torus, Transform } from 'ogl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStage } from './stage'
import { createMarkGeometry } from './extrudeMark'
import { createHalftoneProgram } from './halftoneProgram'

const Z_START = 12
const Z_END = -34
const COUNT = 46

// Deterministic PRNG so the field composition is identical on every load.
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

/**
 * Pinned fly-through: scroll drives the camera down a tunnel of play pieces
 * (bricks, diamonds, rings, pegs, Polykromy marks).
 */
export function WorldsField({ sectionRef, depthRef }) {
  const host = useRef(null)

  useEffect(() => {
    const container = host.current
    const section = sectionRef.current
    if (!container || !section) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stage = createStage(container, { fov: 55, z: Z_START })
    const { gl } = stage
    const program = createHalftoneProgram(gl, { cell: 5, dpr: stage.dpr })

    const geometries = [
      new Box(gl, { width: 1.4, height: 0.7, depth: 0.7 }), // brick
      new Box(gl, { width: 0.8, height: 0.8, depth: 0.8 }), // block
      new Sphere(gl, { radius: 0.75, widthSegments: 4, heightSegments: 2 }), // diamond
      new Torus(gl, { radius: 0.55, tube: 0.2, radialSegments: 8, tubularSegments: 18 }),
      new Cylinder(gl, { radiusTop: 0.35, radiusBottom: 0.35, height: 0.9, radialSegments: 10 }),
      createMarkGeometry(gl, { depth: 0.3, scale: 1 / 420 }),
    ]

    const rand = mulberry32(2026)
    const field = new Transform()
    field.setParent(stage.scene)
    const pieces = []

    for (let i = 0; i < COUNT; i++) {
      const geometry = geometries[i % geometries.length]
      const mesh = new Mesh(gl, { geometry, program })
      const angle = rand() * Math.PI * 2
      const radius = 2.2 + rand() * 4.2
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.7,
        Z_START - 6 - (i / COUNT) * (Z_START - 6 - (Z_END + 3)),
      )
      const s = 0.7 + rand() * 0.9
      mesh.scale.set(s, s, s)
      mesh.rotation.set(rand() * 6.28, rand() * 6.28, rand() * 6.28)
      mesh.setParent(field)
      pieces.push({ mesh, spin: [(rand() - 0.5) * 0.8, (rand() - 0.5) * 0.8] })
    }

    // big hero mark at the end of the tunnel
    const finale = new Mesh(gl, { geometry: geometries[5], program })
    finale.scale.set(1.5, 1.5, 1.5)
    finale.position.set(0, 0, Z_END - 9)
    finale.setParent(stage.scene)

    const state = { progress: 0 }
    const setDepth = (z) => {
      if (depthRef.current) depthRef.current.textContent = (z >= 0 ? '+' : '-') + Math.abs(z).toFixed(2)
    }

    if (reduce) {
      stage.camera.position.z = (Z_START + Z_END) / 2
      setDepth(stage.camera.position.z)
      stage.renderStatic()
      return () => stage.destroy()
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=220%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        state.progress = self.progress
      },
    })

    const pointer = { x: 0, y: 0 }
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    let frame = 0
    stage.start((dt, t) => {
      const cam = stage.camera
      const targetZ = gsap.utils.interpolate(Z_START, Z_END, state.progress)
      cam.position.z += (targetZ - cam.position.z) * 0.12
      cam.position.x += (pointer.x * 0.8 - cam.position.x) * 0.05
      cam.position.y += (-pointer.y * 0.5 - cam.position.y) * 0.05
      cam.lookAt([cam.position.x * 0.4, cam.position.y * 0.4, cam.position.z - 10])
      field.rotation.z = state.progress * 0.9

      pieces.forEach(({ mesh, spin }) => {
        mesh.rotation.x += spin[0] * dt
        mesh.rotation.y += spin[1] * dt
      })
      finale.rotation.y = Math.sin(t * 0.6) * 0.5
      if (++frame % 4 === 0) setDepth(cam.position.z)
    })

    return () => {
      window.removeEventListener('pointermove', onPointer)
      st.kill()
      stage.destroy()
    }
  }, [sectionRef, depthRef])

  return <div className="worlds__canvas" ref={host} />
}
