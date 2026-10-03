const { test } = require('node:test')
const assert = require('node:assert/strict')
require('./register-ts.cjs')
const { Vector3 } = require('three')
const { ORBITS, orbitPosition, damp } = require('../src/scene/mechanics.ts')

for(const config of ORBITS) {
 test(`${config.id} remains on its ellipse over a full revolution`, () => {
  assert.notEqual(config.radiusX,config.radiusZ)
  const position = new Vector3()
  for(let step=0;step<=120;step++) {
   orbitPosition(config,step/120*Math.PI*2/config.speed,position)
   assert.ok(Math.abs(position.x**2/config.radiusX**2 + position.z**2/config.radiusZ**2 - 1)<1e-10)
   assert.equal(position.y,0)
  }
  const first = orbitPosition(config,0,new Vector3())
  const end = orbitPosition(config,Math.PI*2/config.speed,new Vector3())
  assert.ok(first.distanceTo(end)<1e-9)
 })
}

test('parallax damping converges smoothly and is frame-rate independent', () => {
 const simulate = (hz) => { let value=0; for(let i=0;i<hz;i++) value=damp(value,.1,1/hz);return value }
 assert.ok(Math.abs(simulate(30)-simulate(120))<1e-10)
 assert.ok(simulate(60)<.1&&simulate(60)>.09)
 assert.equal(damp(.05,.1,0),.05)
 assert.ok(damp(.05,0,1/60)<.05)
})
