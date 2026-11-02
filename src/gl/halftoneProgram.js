import { Color, Program } from 'ogl'
import { COLORS } from '../brand/mark'

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Two-ink print shading: lit faces stay solid ink, shadowed faces get a
// yellow halftone screen whose dot size follows the light falloff.
const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  uniform vec3 uInkDeep;
  uniform vec3 uSun;
  uniform vec3 uLight;
  uniform float uCell;
  uniform float uDpr;
  varying vec3 vNormal;

  void main() {
    vec3 n = normalize(vNormal);
    float diff = dot(n, normalize(uLight)) * 0.5 + 0.5;
    float tone = floor(diff * 4.0) / 4.0;

    // caps facing the viewer print in ink, extrusion walls in deep ink
    float isCap = step(0.6, abs(n.z));
    vec3 col = mix(uInkDeep, uInk, step(0.5, tone) * isCap);

    // 45-degree rotated screen, like an offset print plate
    vec2 p = gl_FragCoord.xy / (uCell * uDpr);
    p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
    float d = length(fract(p) - 0.5);
    float shade = 1.0 - tone;
    float radius = shade * 0.62;
    float dots = 1.0 - smoothstep(radius - 0.06, radius + 0.06, d);
    col = mix(col, uSun, dots * step(0.26, shade));

    gl_FragColor = vec4(col, 1.0);
  }
`

export function createHalftoneProgram(gl, { cell = 7, dpr = 1 } = {}) {
  return new Program(gl, {
    vertex,
    fragment,
    cullFace: false,
    uniforms: {
      uInk: { value: new Color(COLORS.ink) },
      uInkDeep: { value: new Color(COLORS.inkDeep) },
      uSun: { value: new Color(COLORS.sun) },
      uLight: { value: [0.55, 0.75, 0.9] },
      uCell: { value: cell },
      uDpr: { value: dpr },
    },
  })
}
