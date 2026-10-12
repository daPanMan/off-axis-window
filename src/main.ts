import './style.css'
import * as THREE from 'three'
import { applyOffAxisProjection, type OffAxisProjectionSettings } from './offAxisProjection'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

app.innerHTML = `
  <div class="scene-shell">
    <div id="viewport"></div>
    <div class="hud">
      <div class="panel">
        <h1>Off-Axis Projection</h1>

        <label class="control">
          <span>Eye X <strong id="exValue">0.00</strong></span>
          <input id="ex" type="range" min="-0.8" max="0.8" step="0.01" value="0" />
        </label>

        <label class="control">
          <span>Eye Y <strong id="eyValue">0.00</strong></span>
          <input id="ey" type="range" min="-0.5" max="0.5" step="0.01" value="0" />
        </label>

        <label class="control">
          <span>Distance <strong id="dValue">1.60</strong></span>
          <input id="d" type="range" min="0.8" max="3" step="0.01" value="1.6" />
        </label>

        <label class="toggle-row">
          <input id="offAxisToggle" type="checkbox" checked />
          <span>Off-axis mode</span>
        </label>

        <button id="recenter" type="button">Recenter</button>
      </div>
    </div>
  </div>
`

const viewport = document.querySelector<HTMLDivElement>('#viewport')
const exSlider = document.querySelector<HTMLInputElement>('#ex')
const eySlider = document.querySelector<HTMLInputElement>('#ey')
const dSlider = document.querySelector<HTMLInputElement>('#d')
const offAxisToggle = document.querySelector<HTMLInputElement>('#offAxisToggle')
const recenterButton = document.querySelector<HTMLButtonElement>('#recenter')
const exValue = document.querySelector<HTMLElement>('#exValue')
const eyValue = document.querySelector<HTMLElement>('#eyValue')
const dValue = document.querySelector<HTMLElement>('#dValue')

if (!viewport || !exSlider || !eySlider || !dSlider || !offAxisToggle || !recenterButton || !exValue || !eyValue || !dValue) {
  throw new Error('Required UI elements not found')
}

const settings: OffAxisProjectionSettings = {
  ex: 0,
  ey: 0,
  d: 1.6,
  width: 1.6,
  height: 0.9,
  near: 0.1,
  far: 18,
}

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x090d18, 1)
viewport.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x090d18)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50)
camera.position.set(settings.ex, settings.ey, settings.d)

const ambientLight = new THREE.HemisphereLight(0xdfefff, 0x101827, 1.4)
scene.add(ambientLight)

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
keyLight.position.set(4, 5, 2)
scene.add(keyLight)

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95, metalness: 0.05 }),
)
floor.rotation.x = -Math.PI / 2
floor.position.y = -1.2
scene.add(floor)

const grid = new THREE.GridHelper(12, 24, 0x60a5fa, 0x334155)
grid.position.y = -1.19
scene.add(grid)

const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0x101827,
  emissive: 0x0a1220,
  roughness: 0.7,
  metalness: 0.1,
  side: THREE.DoubleSide,
})

const screen = new THREE.Mesh(new THREE.PlaneGeometry(settings.width, settings.height), screenMaterial)
screen.position.set(0, 0, 0)
scene.add(screen)

const screenBorder = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.PlaneGeometry(settings.width, settings.height)),
  new THREE.LineBasicMaterial({ color: 0x7dd3fc }),
)
screenBorder.position.z = 0.02
scene.add(screenBorder)

const target = new THREE.Mesh(
  new THREE.SphereGeometry(0.06, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x1d4ed8 }),
)
target.position.set(0, 0, 0)
scene.add(target)

const depthObjects = [
  { position: new THREE.Vector3(-0.75, 0.15, -1.4), scale: 0.32, color: 0xfbbf24 },
  { position: new THREE.Vector3(0.85, -0.1, -2.8), scale: 0.42, color: 0x34d399 },
  { position: new THREE.Vector3(-0.15, 0.55, -4.8), scale: 0.6, color: 0xf472b6 },
  { position: new THREE.Vector3(0.38, -0.5, -6.5), scale: 0.7, color: 0x60a5fa },
]

const objectMeshes = depthObjects.map(({ position, scale, color }) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.25 }),
  )

  mesh.scale.setScalar(scale)
  mesh.position.copy(position)
  scene.add(mesh)
  return mesh
})

const formatValue = (value: number) => Number(value).toFixed(2)

const syncHudValues = () => {
  exValue.textContent = formatValue(settings.ex)
  eyValue.textContent = formatValue(settings.ey)
  dValue.textContent = formatValue(settings.d)
}

const updateProjection = () => {
  const aspect = viewport.clientWidth / viewport.clientHeight
  camera.aspect = aspect
  camera.position.set(settings.ex, settings.ey, settings.d)
  camera.lookAt(0, 0, 0)

  if (offAxisToggle.checked) {
    applyOffAxisProjection(camera, settings)
  } else {
    camera.fov = 45
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }
}

const recenter = () => {
  settings.ex = 0
  settings.ey = 0
  settings.d = 1.6
  exSlider.value = settings.ex.toString()
  eySlider.value = settings.ey.toString()
  dSlider.value = settings.d.toString()
  syncHudValues()
  updateProjection()
}

exSlider.addEventListener('input', (event) => {
  const input = event.currentTarget as HTMLInputElement
  settings.ex = Number(input.value)
  syncHudValues()
  updateProjection()
})

eySlider.addEventListener('input', (event) => {
  const input = event.currentTarget as HTMLInputElement
  settings.ey = Number(input.value)
  syncHudValues()
  updateProjection()
})

dSlider.addEventListener('input', (event) => {
  const input = event.currentTarget as HTMLInputElement
  settings.d = Number(input.value)
  syncHudValues()
  updateProjection()
})

offAxisToggle.addEventListener('change', () => {
  updateProjection()
})

recenterButton.addEventListener('click', recenter)

const onResize = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  if (!offAxisToggle.checked) {
    camera.updateProjectionMatrix()
  }
}

window.addEventListener('resize', onResize)

syncHudValues()
updateProjection()

const clock = new THREE.Clock()

function animate() {
  const elapsed = clock.getElapsedTime()

  objectMeshes.forEach((mesh, index) => {
    mesh.rotation.x = elapsed * (0.4 + index * 0.12)
    mesh.rotation.y = elapsed * (0.6 + index * 0.15)
  })

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
