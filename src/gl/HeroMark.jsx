import { useEffect, useRef } from 'react'
import { Mesh } from 'ogl'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStage } from './stage'
import { createMarkGeometry } from './extrudeMark'
import { createHalftoneProgram } from './halftoneProgram'

const fmt = (rad) => {
  const deg = ((((rad * 180) / Math.PI) % 360) + 360) % 360
  return deg.toFixed(1).padStart(5, '0')
}

export function HeroMark() {
  const host = useRef(null)
  const readX = useRef(null)
  const readY = useRef(null)

  useEffect(() => {
    const container = host.current
    if (!container) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stage = createStage(container, { fov: 32, z: 6.4 })
    const program = createHalftoneProgram(stage.gl, { cell: 6, dpr: stage.dpr })
    const mesh = new Mesh(stage.gl, { geometry: createMarkGeometry(stage.gl), program })
    mesh.setParent(stage.scene)
    mesh.rotation.set(-0.18, -0.5, 0)

    const pointer = { x: 0, y: 0 }
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    // scroll spin: the mark turns away as the hero leaves
    let scrollP = 0
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top+=80',
      end: 'bottom top',
      onUpdate: (self) => {
        scrollP = self.progress
      },
    })

    if (reduce) {
      stage.renderStatic()
      if (readX.current && readY.current) {
        readX.current.textContent = fmt(mesh.rotation.x)
        readY.current.textContent = fmt(mesh.rotation.y)
      }
    } else {
      let idle = 0
      let frame = 0
      stage.start((dt) => {
        idle += dt * 0.35
        const tx = -0.18 + pointer.y * 0.35 + scrollP * 0.9
        const ty = Math.sin(idle) * 0.55 + pointer.x * 0.6 + scrollP * Math.PI
        mesh.rotation.x += (tx - mesh.rotation.x) * 0.06
        mesh.rotation.y += (ty - mesh.rotation.y) * 0.06
        mesh.position.y = Math.sin(idle * 1.6) * 0.06
        if (++frame % 6 === 0 && readX.current && readY.current) {
          readX.current.textContent = fmt(mesh.rotation.x)
          readY.current.textContent = fmt(mesh.rotation.y)
        }
      })
    }

    return () => {
      window.removeEventListener('pointermove', onPointer)
      st.kill()
      stage.destroy()
    }
  }, [])

  return (
    <figure className="hero-mark">
      <div className="hero-mark__canvas" ref={host} />
      <span className="crosshair crosshair--tl" aria-hidden="true" />
      <span className="crosshair crosshair--tr" aria-hidden="true" />
      <span className="crosshair crosshair--bl" aria-hidden="true" />
      <span className="crosshair crosshair--br" aria-hidden="true" />
      <figcaption className="hero-mark__meta mono">
        <span>[ PK / MARK ]</span>
        <span>
          RX <output ref={readX}>000.0</output>° RY <output ref={readY}>000.0</output>°
        </span>
      </figcaption>
    </figure>
  )
}
