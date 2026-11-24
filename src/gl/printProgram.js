import { Color, Program } from 'ogl'
import { COLORS } from '../brand/mark'

// Island shader. Same two-ink offset-print language as the mark's halftone
// program, extended with per-material treatments (aInk) and a GPU-side
// "scatter": each piece rotates about its own pivot and flies along its
// scatter vector as uScatter goes 0 → 1.
const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute float aInk;
  attribute vec3 aPivot;
  attribute vec3 aScatter;
  attribute float aSeed;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uScatter;
  uniform float uLift;
  uniform float uTime;

  varying vec3 vNormal;
  varying float vInk;
  varying vec3 vPos;

  vec3 rotateAxis(vec3 v, vec3 k, float a) {
    float c = cos(a);
    float s = sin(a);
    return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
  }

  void main() {
    // ease each piece with a small per-piece delay so the swarm feels organic
    float s = smoothstep(aSeed * 0.35, 0.65 + aSeed * 0.35, uScatter);
    vec3 axis = normalize(vec3(sin(aSeed * 12.9), 0.8, cos(aSeed * 7.3)));
    float angle = s * (aSeed * 8.0 - 4.0) + s * uTime * (aSeed - 0.5) * 0.6;

    vec3 local = rotateAxis(position - aPivot, axis, angle) * (1.0 - 0.45 * s);
    vec3 n = rotateAxis(normal, axis, angle);
    vec3 p = aPivot + local + aScatter * s + vec3(0.0, uLift, 0.0);
    p.y += sin(uTime * 0.9 + aSeed * 40.0) * 0.18 * s;

    vNormal = normalize(normalMatrix * n);
    vInk = aInk;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform vec3 uInkDeep;
  uniform vec3 uSun;
  uniform vec3 uLight;
  uniform float uCell;
  uniform float uDpr;
  uniform float uTime;
  varying vec3 vNormal;
  varying float vInk;
  varying vec3 vPos;

  // dot coverage of a 45-degree screen at the given radius (0..~0.7)
  float screen(float radius) {
    vec2 p = gl_FragCoord.xy / (uCell * uDpr);
    p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
    float d = length(fract(p) - 0.5);
    return 1.0 - smoothstep(radius - 0.06, radius + 0.06, d);
  }

  void main() {
    vec3 n = normalize(vNormal);
    float diff = dot(n, normalize(uLight)) * 0.5 + 0.5;
    float tone = floor(diff * 4.0) / 4.0;
    float shade = 1.0 - tone;
    float k = floor(vInk + 0.5);
    vec3 col;

    if (k < 0.5) {
      // solid ink (grass): sun dots creep in only in shadow
      col = mix(uInk, uSun, screen(shade * 0.62) * step(0.26, shade));
    } else if (k < 1.5) {
      // foliage: always a light screen so trees read against the ground
      col = mix(uInk, uSun, screen(0.16 + shade * 0.46));
    } else if (k < 2.5) {
      // earth and wood: deep ink, fine highlights
      col = mix(uInkDeep, uSun, screen(shade * 0.36) * step(0.4, shade));
    } else if (k < 3.5) {
      // paper (stone): sun substrate printed with ink in the shadows
      col = mix(uSun, uInk, screen(0.08 + shade * 0.62) * step(0.2, shade));
    } else if (k < 4.5) {
      // accent: solid sun with a thin ink key line on the dark side
      col = mix(uSun, uInkDeep, step(0.5, shade));
    } else {
      // water: drifting ink hatching on sun
      float lines = step(0.72, fract((vPos.x * 0.8 + vPos.z) * 3.0 - uTime * 0.35));
      col = mix(uSun, uInk, lines);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`

export function createPrintProgram(gl, { cell = 6, dpr = 1 } = {}) {
  return new Program(gl, {
    vertex,
    fragment,
    cullFace: false,
    uniforms: {
      uInk: { value: new Color(COLORS.ink) },
      uInkDeep: { value: new Color(COLORS.inkDeep) },
      uSun: { value: new Color(COLORS.sun) },
      uLight: { value: [0.55, 0.85, 0.7] },
      uCell: { value: cell },
      uDpr: { value: dpr },
      uScatter: { value: 0 },
      uLift: { value: 0 },
      uTime: { value: 0 },
    },
  })
}
