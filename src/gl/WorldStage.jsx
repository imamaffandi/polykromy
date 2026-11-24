import { useEffect, useRef } from 'react'
import { Mesh, Transform, Vec3 } from 'ogl'
import { createStage } from './stage'
import { createMarkGeometry } from './extrudeMark'
import { createHalftoneProgram } from './halftoneProgram'
import { createPrintProgram } from './printProgram'
import { buildIsland, KIT_MODELS } from './island'
import { loadKit } from './kit'
import { emit, siteStore } from '../lib/siteStore'
import { isNarrow } from '../lib/env'
import { PROCESS } from '../content/site'

const damp = (current, target, k) => current + (target - current) * k

/**
 * The one WebGL canvas behind the whole story. It owns no animation logic of
 * its own beyond smoothing: the scroll timeline writes `state`, this reads it.
 *
 * - `pinsRef`: array of DOM buttons positioned over the hotspot anchors
 * - `onFocus(i)`: called only when the focused hotspot changes
 * - `isStatic`: reduced motion; draw one finished composition and stop
 */
export function WorldStage({ state, pinsRef, onFocus, isStatic = false }) {
  const host = useRef(null)
  const onFocusRef = useRef(onFocus)
  useEffect(() => {
    onFocusRef.current = onFocus
  })

  useEffect(() => {
    const container = host.current
    if (!container) return
    let disposed = false
    const narrow = isNarrow()

    const stage = createStage(container, { fov: 35, z: 8, maxDpr: narrow ? 1.5 : 2 })
    const { gl, camera, scene } = stage

    // brand mark, in the original halftone program
    const mark = new Mesh(gl, {
      geometry: createMarkGeometry(gl),
      program: createHalftoneProgram(gl, { cell: 6, dpr: stage.dpr }),
    })
    mark.setParent(scene)

    const island = new Transform()
    island.setParent(scene)
    const programs = [0, 1, 2].map(() => createPrintProgram(gl, { cell: narrow ? 4.5 : 5.5, dpr: stage.dpr }))

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    // drag (or swipe sideways on touch) to spin the mark, with inertia
    const drag = { active: false, lastX: 0, vel: 0, offset: 0, told: false }
    const onDown = (e) => {
      if (state.heroLook < 0.5) return // only while the mark is the hero
      drag.active = true
      drag.lastX = e.clientX
      container.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      if (!drag.active) return
      const dx = e.clientX - drag.lastX
      drag.lastX = e.clientX
      drag.vel = dx * 0.012
      drag.offset += drag.vel
      if (!drag.told && Math.abs(drag.offset) > 1.2) {
        drag.told = true
        emit('mark-spun')
      }
    }
    const onUp = () => {
      drag.active = false
    }
    container.addEventListener('pointerdown', onDown)
    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerup', onUp)
    container.addEventListener('pointercancel', onUp)

    const anchors = PROCESS.map((p) => new Vec3(...p.anchor))
    const projected = new Vec3()
    let lastFocus = -2

    const placeCamera = (s, px = 0, py = 0) => {
      const az = s.az + px
      const el = Math.min(1.45, Math.max(-0.2, s.el + py))
      camera.position.set(
        s.tx + s.radius * Math.sin(az) * Math.cos(el),
        s.ty + s.radius * Math.sin(el),
        s.tz + s.radius * Math.cos(az) * Math.cos(el),
      )
      camera.lookAt([s.tx, s.ty, s.tz])
    }

    const placeMark = (s, sway = 0, tiltX = 0) => {
      mark.position.set(s.mx, s.my, s.mz)
      mark.scale.set(s.mScale, s.mScale, s.mScale)
      const free = s.mSpin + sway + drag.offset
      mark.rotation.y = free + (s.az - free) * s.mFace
      mark.rotation.x = (-0.18 + tiltX) * (1 - s.mFace)
      mark.program.uniforms.uSwap.value = s.mSwap
    }

    const placeIsland = (s, time) => {
      island.position.y = s.iy
      programs.forEach((p, i) => {
        p.uniforms.uScatter.value = s.scatter
        p.uniforms.uLift.value = i === 1 ? s.lift1 : i === 2 ? s.lift2 : 0
        p.uniforms.uTime.value = time
      })
    }

    const updatePins = (s) => {
      const pins = pinsRef.current
      if (!pins) return
      const { width, height } = container.getBoundingClientRect()
      camera.updateMatrixWorld()
      anchors.forEach((a, i) => {
        const el = pins[i]
        if (!el) return
        camera.project(projected.copy(a))
        const visible = s.pins > 0.01 && projected.z < 1
        el.style.opacity = visible ? String(s.pins) : '0'
        el.style.visibility = visible ? 'visible' : 'hidden'
        el.style.transform = `translate3d(${((projected.x + 1) / 2) * width}px, ${((1 - projected.y) / 2) * height}px, 0)`
      })
      const focus = s.focus < -0.5 ? -1 : Math.round(s.focus)
      if (focus !== lastFocus) {
        lastFocus = focus
        onFocusRef.current?.(focus)
      }
    }

    loadKit(KIT_MODELS, (p) => siteStore.set({ loadProgress: p }))
      .then((kit) => {
        if (disposed) return
        buildIsland(gl, kit).forEach((geometry, i) => {
          const mesh = new Mesh(gl, { geometry, program: programs[i] })
          mesh.frustumCulled = false // the vertex shader moves pieces outside the baked bounds
          mesh.setParent(island)
        })
        siteStore.set({ worldReady: true })

        if (isStatic) {
          // a finished, still composition: island assembled, mark on its pedestal
          const still = { ...state, tx: 0, ty: 0.9, tz: 0, radius: narrow ? 19 : 12.5, az: 0.6, el: 0.42 }
          Object.assign(still, {
            iy: 0,
            scatter: 0,
            lift1: 0,
            lift2: 0,
            mx: 0,
            my: 1.3,
            mz: 0,
            mScale: 0.8,
            mFace: 1,
            mSwap: 1,
          })
          placeCamera(still)
          placeMark(still)
          placeIsland(still, 0)
          stage.renderStatic()
          return
        }

        let time = 0
        stage.start((dt) => {
          time += dt
          const s = state
          pointer.sx = damp(pointer.sx, pointer.x, 0.06)
          pointer.sy = damp(pointer.sy, pointer.y, 0.06)

          if (!drag.active) {
            drag.offset += drag.vel
            drag.vel *= 0.94
          }

          // a little camera parallax everywhere; full pointer play while the mark is the hero
          placeCamera(s, pointer.sx * 0.06, -pointer.sy * 0.03)
          const sway = (Math.sin(time * 0.35) * 0.5 + pointer.sx * 0.6) * s.heroLook
          placeMark(s, sway, pointer.sy * 0.35 * s.heroLook)
          mark.position.y += Math.sin(time * 0.55) * 0.07 * (1 - s.mFace)
          placeIsland(s, time)

          // interactive lighting: the key light swings with the cursor
          const light = [0.55 + pointer.sx * 0.7, 0.85 - pointer.sy * 0.3, 0.7]
          programs.forEach((p) => (p.uniforms.uLight.value = light))
          mark.program.uniforms.uLight.value = [0.55 + pointer.sx * 0.5, 0.75 - pointer.sy * 0.5, 0.9]

          updatePins(s)
        })
      })
      .catch((err) => {
        console.error(err)
        siteStore.set({ worldReady: true }) // never trap the loader
      })

    return () => {
      disposed = true
      window.removeEventListener('pointermove', onPointer)
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup', onUp)
      container.removeEventListener('pointercancel', onUp)
      stage.destroy()
    }
  }, [state, pinsRef, isStatic])

  return <div className="world" ref={host} data-cursor="Drag" />
}
