import type { Camera, Matrix4 } from 'three'

export interface OffAxisProjectionSettings {
  ex: number
  ey: number
  d: number
  width: number
  height: number
  near: number
  far: number
}

export function calculateOffAxisFrustum({
  ex,
  ey,
  d,
  width,
  height,
  near,
}: OffAxisProjectionSettings) {
  const safeDistance = Math.max(d, 0.0001)
  const halfWidth = width / 2
  const halfHeight = height / 2

  const left = near * ((-halfWidth - ex) / safeDistance)
  const right = near * ((halfWidth - ex) / safeDistance)
  const bottom = near * ((-halfHeight - ey) / safeDistance)
  const top = near * ((halfHeight - ey) / safeDistance)

  return { left, right, top, bottom }
}

export function applyOffAxisProjection(
  camera: Camera & { projectionMatrix: Matrix4; projectionMatrixInverse: Matrix4 },
  settings: OffAxisProjectionSettings,
) {
  const { left, right, top, bottom } = calculateOffAxisFrustum(settings)

  camera.position.set(settings.ex, settings.ey, settings.d)
  camera.lookAt(0, 0, 0)
  camera.projectionMatrix.makePerspective(left, right, top, bottom, settings.near, settings.far)
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
  camera.updateMatrixWorld()
}
