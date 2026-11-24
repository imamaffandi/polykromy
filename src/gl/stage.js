import { Camera, Renderer, Transform } from 'ogl'

/**
 * Minimal OGL stage bound to a container element: handles DPR, resize,
 * and pausing the frame loop while the container is off-screen.
 */
export function createStage(container, { fov = 35, z = 6, maxDpr = 2 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  const renderer = new Renderer({ dpr, alpha: true, antialias: true, premultipliedAlpha: false })
  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  gl.canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(gl.canvas)

  const camera = new Camera(gl, { fov })
  camera.position.z = z
  const scene = new Transform()
  let isStatic = false
  const draw = () => renderer.render({ scene, camera })

  const resize = () => {
    const { width, height } = container.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.perspective({ aspect: width / height })
    // resizing clears the drawing buffer; static (reduced-motion) scenes must redraw
    if (isStatic) draw()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  let visible = true
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })
  io.observe(container)

  let raf = 0
  let last = performance.now()
  const start = (onFrame) => {
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!visible) return
      onFrame(dt, now / 1000)
      draw()
    }
    raf = requestAnimationFrame(loop)
  }

  const renderStatic = () => {
    isStatic = true
    draw()
  }

  const destroy = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    gl.canvas.remove()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { gl, dpr, renderer, camera, scene, start, destroy, renderStatic }
}
