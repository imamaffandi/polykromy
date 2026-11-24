import { gsap } from 'gsap'
import { PROCESS } from '../content/site'
import { PEDESTAL_TOP } from '../gl/island'

/** Chapters are one timeline unit each; the master timeline is 6 units long. */
export const STORY_UNITS = 6

/** Timeline positions where each hotspot is in full focus (chapter D). */
export const FOCUS_AT = PROCESS.map((_, i) => 3.05 + i * 0.3 + 0.22)

const MARK_HALF_HEIGHT = 0.99 // mark geometry: centre to beak tip, in units

/**
 * Plain, mutable scene state. The timeline tweens it, the render loop reads it.
 * Camera is a spherical rig around a target: azimuth, elevation, radius.
 */
export function createStoryState() {
  return {
    tx: 0,
    ty: 5.2,
    tz: 0,
    radius: 7.6,
    az: 0,
    el: 0,
    mx: 1.75,
    my: 5.2,
    mz: 0,
    mScale: 1,
    mSpin: 0,
    mFace: 0,
    mSwap: 0,
    heroLook: 1,
    iy: -5,
    scatter: 1,
    lift1: 2.2,
    lift2: 4.4,
    focus: -1,
    pins: 0,
  }
}

/** Per-breakpoint framing so the composition holds on tall phone screens. */
function framing(narrow) {
  return narrow
    ? { heroMark: [0, 6.75], heroRadius: 12, wide: 23, mid: 21, close: 7.4, form: 19, dive: 10 }
    : { heroMark: [1.75, 5.2], heroRadius: 7.6, wide: 16, mid: 14, close: 5.4, form: 12.5, dive: 7.5 }
}

export function applyHeroFraming(state, narrow) {
  const f = framing(narrow)
  state.mx = f.heroMark[0]
  state.my = f.heroMark[1]
  state.radius = f.heroRadius
}

/** Scene (WebGL) choreography: tweens `state` only. */
export function buildSceneTimeline(state, { narrow }) {
  const f = framing(narrow)
  const tl = gsap.timeline({ defaults: { ease: 'none' } })

  // A → S: the camera pulls up and back, the mark spins away, the debris field appears
  tl.fromTo(
    state,
    {
      tx: 0,
      ty: 5.2,
      tz: 0,
      radius: f.heroRadius,
      az: 0,
      el: 0,
      mx: f.heroMark[0],
      my: f.heroMark[1],
      mScale: 1,
      mSpin: 0,
      heroLook: 1,
      iy: -5,
    },
    {
      iy: 0,
      ty: 1.6,
      radius: f.wide,
      az: 0.55,
      el: 0.34,
      mx: 0,
      my: 3.3,
      mScale: 0.62,
      mSpin: Math.PI * 2,
      heroLook: 0,
      duration: 1,
      ease: 'power1.inOut',
    },
    0,
  )

  // S: hold the prototype cloud, slow drift around it
  tl.to(state, { az: 0.95, radius: f.mid + 1, duration: 1 }, 1)

  // C: pieces fly home, then the stone and flora layers drop in on top
  tl.to(state, { scatter: 0, duration: 0.45, ease: 'power2.inOut' }, 2)
  tl.to(state, { lift1: 0, duration: 0.25, ease: 'power3.in' }, 2.42)
  tl.to(state, { lift2: 0, duration: 0.25, ease: 'power3.in' }, 2.66)
  tl.to(state, { az: 1.9, el: 0.5, radius: f.mid, ty: 0.6, my: 3.7, duration: 1, ease: 'power1.inOut' }, 2)

  // D: close-ups on each hotspot
  tl.to(state, { pins: 1, duration: 0.08 }, 3)
  const azFor = [-0.75, 1.15, 0.35]
  PROCESS.forEach((p, i) => {
    tl.to(
      state,
      {
        tx: p.anchor[0],
        ty: p.anchor[1] - 0.25,
        tz: p.anchor[2],
        radius: f.close,
        az: azFor[i] + Math.PI * 0.62,
        el: 0.32,
        focus: i,
        duration: 0.22,
        ease: 'power2.inOut',
      },
      FOCUS_AT[i] - 0.22,
    )
  })
  tl.to(state, { pins: 0, duration: 0.08 }, 3.9)
  tl.set(state, { focus: -1 }, 3.98)

  // F: pull back to the full diorama while the mark lands on its pedestal
  tl.to(state, { tx: 0, ty: 0.9, tz: 0, radius: f.form, az: 2.75, el: 0.42, duration: 0.6, ease: 'power2.inOut' }, 4)
  tl.to(
    state,
    {
      mx: 0,
      my: PEDESTAL_TOP + MARK_HALF_HEIGHT * 0.8,
      mz: 0,
      mScale: 0.8,
      mFace: 1,
      duration: 0.5,
      ease: 'power3.inOut',
    },
    4.2,
  )
  // landing on the ink island, the mark reverses to sun-on-ink so it still reads
  tl.to(state, { mSwap: 1, duration: 0.15 }, 4.55)
  tl.to(state, { az: 3.2, duration: 0.4 }, 4.6)

  // L: rise to a top-down view and dive at the mark
  tl.to(state, { el: 1.25, radius: f.dive, ty: 1.1, duration: 0.55, ease: 'power2.in' }, 5)
  tl.to(state, { radius: 2.4, duration: 0.45, ease: 'power3.in' }, 5.55)

  tl.set({}, {}, STORY_UNITS)
  return tl
}

/** HTML choreography inside the sticky viewport, on the same clock as the scene. */
export function buildOverlayTimeline(root, { narrow }) {
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ defaults: { ease: 'none' } })

  // hero hands over to the story
  tl.to(q('.hero__cue'), { autoAlpha: 0, duration: 0.08 }, 0)
  tl.to(q('.hero__copy'), { yPercent: -18, autoAlpha: 0, duration: 0.45, ease: 'power1.in' }, 0.12)
  tl.to(q('.hero__char'), { yPercent: (i) => (i % 2 ? -60 : 60), duration: 0.6, ease: 'power1.in' }, 0)
  tl.to(q('.hero__word'), { autoAlpha: 0, duration: 0.25 }, 0.4)
  tl.fromTo(q('.hud'), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.2 }, 0.75)

  q('.chapter').forEach((panel) => {
    const i = Number(panel.dataset.index)
    const p = gsap.utils.selector(panel)
    const last = i === STORY_UNITS - 1
    tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, i + 0.08)
    // the stamp lands like a rubber stamp: big, fast, a little crooked
    tl.fromTo(
      p('.chapter__stamp'),
      { scale: 2.6, rotate: -18, autoAlpha: 0 },
      { scale: 1, rotate: -6, autoAlpha: 1, duration: 0.1, ease: 'power4.in' },
      i + 0.08,
    )
    tl.fromTo(
      p('.chapter__line > span'),
      { yPercent: 110 },
      { yPercent: 0, stagger: 0.03, duration: 0.18, ease: 'power3.out' },
      i + 0.14,
    )
    tl.fromTo(
      p('.chapter__meta, .chapter__body'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.14 },
      i + 0.2,
    )
    if (!last) tl.to(panel, { autoAlpha: 0, y: narrow ? -24 : -48, duration: 0.12, ease: 'power1.in' }, i + 0.86)
  })

  // chapter D: the process rail rides alongside the hotspot close-ups
  tl.fromTo(q('.process'), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.1 }, 3.04)
  tl.to(q('.process'), { autoAlpha: 0, x: 40, duration: 0.08 }, 3.9)

  // L: an ink iris opens from the mark and becomes the games section
  tl.fromTo(
    q('.story__wipe--rim'),
    { clipPath: 'circle(0% at 50% 50%)' },
    { clipPath: 'circle(95% at 50% 50%)', duration: 0.5, ease: 'power1.in' },
    5.3,
  )
  tl.fromTo(
    q('.story__wipe'),
    { clipPath: 'circle(0% at 50% 50%)' },
    { clipPath: 'circle(75% at 50% 50%)', duration: 0.48, ease: 'power1.in' },
    5.47,
  )
  tl.to(q('.chapter[data-index="5"]'), { autoAlpha: 0, duration: 0.1 }, 5.7)

  // HUD progress
  tl.fromTo(q('.hud__fill'), { scaleY: 0 }, { scaleY: 1, duration: STORY_UNITS }, 0)

  tl.set({}, {}, STORY_UNITS)
  return tl
}
