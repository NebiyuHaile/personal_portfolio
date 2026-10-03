const { test } = require('node:test')
const assert = require('node:assert/strict')
require('./register-ts.cjs')
const storage = new Map()
global.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}
global.window = { localStorage: global.localStorage }
const { Vector3, Quaternion, Matrix4 } = require('three')
const { SECTIONS } = require('../src/content/sections.ts')
const { OVERVIEW, NODE_POSITIONS, createCameraTransition, sampleCameraTransition } = require('../src/scene/navigation.ts')
const { usePortfolioStore: store } = require('../src/store/portfolio.ts')
const lookAt = (position, target) => new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(position, target, new Vector3(0, 1, 0)))
const near = (a, b) => assert.ok(a.distanceTo(b) < 1e-8)

for (const { id } of SECTIONS) {
  test(`camera reaches ${id} and returns to overview`, () => {
    const position = OVERVIEW.clone()
    const orientation = lookAt(position, new Vector3())
    const startOrientation = orientation.clone()
    const transition = createCameraTransition(position, orientation, id)
    sampleCameraTransition(transition, 0, position, orientation, new Quaternion())
    near(position, OVERVIEW)
    assert.ok(orientation.angleTo(startOrientation) < 1e-7)
    for (let step = 1; step <= 100; step++) {
      sampleCameraTransition(transition, step / 100, position, orientation, new Quaternion())
      assert.ok([...position.toArray(), ...orientation.toArray()].every(Number.isFinite))
      assert.ok(Math.abs(orientation.length() - 1) < 1e-8)
    }
    near(position, new Vector3(...NODE_POSITIONS[id]).add(new Vector3(0, 1.8, 3.8)))
    near(new Vector3(0, 0, -1).applyQuaternion(orientation), transition.target.clone().sub(position).normalize())
    const back = createCameraTransition(position, orientation, null)
    sampleCameraTransition(back, 1, position, orientation, new Quaternion())
    near(position, OVERVIEW)
  })
}

test('camera follows an arc and an interrupted transition starts without a jump', () => {
  const position = OVERVIEW.clone()
  const orientation = lookAt(position, new Vector3())
  const first = createCameraTransition(position, orientation, 'experience')
  sampleCameraTransition(first, 0.5, position, orientation, new Quaternion())
  const linearMidpoint = OVERVIEW.clone().add(first.destination).multiplyScalar(0.5)
  assert.ok(position.distanceTo(linearMidpoint) > 0.01)
  const interruptedPosition = position.clone()
  const interruptedOrientation = orientation.clone()
  const next = createCameraTransition(position, orientation, 'contact')
  sampleCameraTransition(next, 0, position, orientation, new Quaternion())
  near(position, interruptedPosition)
  assert.ok(orientation.angleTo(interruptedOrientation) < 1e-7)
  sampleCameraTransition(next, 1, position, orientation, new Quaternion())
  near(position, next.destination)
})

test('navigation synchronizes panels, rejects stale completion, and supports both views', () => {
  store.getState().selectNode('projects')
  const firstId = store.getState().transitionId
  assert.equal(store.getState().activeNode, 'projects')
  assert.equal(store.getState().focusedIndex, 2)
  assert.equal(store.getState().isPanelOpen, true)
  assert.equal(store.getState().isAnimating, true)
  store.getState().selectNode('experience')
  store.getState().finishTransition(firstId)
  assert.equal(store.getState().isAnimating, true)
  store.getState().finishTransition(store.getState().transitionId)
  assert.equal(store.getState().isAnimating, false)
  store.getState().setViewMode('scroll')
  store.getState().selectNode('skills')
  assert.equal(store.getState().useListView, true)
  assert.equal(store.getState().isAnimating, false)
  store.getState().setUseListView(false)
  assert.equal(store.getState().viewMode, 'orbital')
  store.getState().setReducedMotion(true)
  store.getState().selectNode('contact')
  assert.equal(store.getState().isAnimating, false)
  store.getState().closePanel()
  assert.equal(store.getState().activeNode, null)
  assert.equal(store.getState().focusedIndex, -1)
  assert.equal(store.getState().isPanelOpen, false)
})


test('persisted view rehydrates without persisting transient animation state', async () => {
  store.getState().setViewMode('scroll')
  const saved = JSON.parse(storage.get('orbital-portfolio-storage'))
  assert.equal(saved.state.viewMode, 'scroll')
  assert.equal(saved.state.activeNode, undefined)
  assert.equal(saved.state.isAnimating, undefined)
  store.setState({ viewMode: 'orbital', useListView: false })
  storage.set('orbital-portfolio-storage', JSON.stringify(saved))
  await store.persist.rehydrate()
  assert.equal(store.getState().viewMode, 'scroll')
  assert.equal(store.getState().useListView, true)
})

test('focus captures the selected node world position without mutating it', () => {
  const world = new Vector3(4.5, .4, -2.3)
  const original = world.clone()
  const transition = createCameraTransition(OVERVIEW, lookAt(OVERVIEW, new Vector3()), 'projects', world)
  near(transition.target, original)
  near(transition.destination, original.clone().add(new Vector3(0, 1.8, 3.8)))
  world.set(0, 0, 0)
  near(transition.target, original)
})
