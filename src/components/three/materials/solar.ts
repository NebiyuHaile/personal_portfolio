import { shaderMaterial } from "@react-three/drei"

const coreVertex = `
  varying vec3 vPoint;
  varying vec3 vNormal;
  void main() {
    vPoint = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const coreFragment = `
  uniform float uTime;
  varying vec3 vPoint;
  varying vec3 vNormal;
  void main() {
    vec3 p = vPoint * 13.0;
    float plasma = sin(p.x + sin(p.y * 1.7 + uTime * .3))
      * sin(p.z * 1.5 - uTime * .2) * .5 + .5;
    float granules = sin(p.x * 3.0 + p.z * 2.0) * sin(p.y * 4.0 + uTime * .2) * .1;
    float rim = pow(1.0 - abs(vNormal.z), 2.0);
    vec3 heat = mix(vec3(1.0, .22, .035), vec3(1.0, .82, .36), clamp(plasma + granules, 0.0, 1.0));
    gl_FragColor = vec4(heat * (2.2 + rim * .8), 1.0);
  }
`
const coronaVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const coronaFragment = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - .5) * 2.0;
    float r = length(p);
    float angle = atan(p.y, p.x);
    float rays = pow(.5 + .5 * sin(angle * 11.0 + sin(angle * 5.0 - uTime * .22)), 5.0);
    float edge = .375 + rays * .055 + sin(angle * 19.0 + uTime * .35) * .009;
    float glow = exp(-max(r - edge, 0.0) * 9.0);
    glow *= smoothstep(.33, .40, r) * (1.0 - smoothstep(.68, 1.0, r));
    vec3 heat = mix(vec3(1.0, .18, .015), vec3(1.0, .65, .2), glow);
    gl_FragColor = vec4(heat * 2.2, glow * .65);
  }
`

export const SolarCoreMaterial = shaderMaterial({ uTime: 0 }, coreVertex, coreFragment)
export const SolarCoronaMaterial = shaderMaterial({ uTime: 0 }, coronaVertex, coronaFragment)
