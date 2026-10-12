# Off-Axis Projection Study Notes

## Project goal

Build a browser-based prototype where a monitor behaves like a window into a 3D scene. The viewer's eye position is tracked or simulated, and the virtual camera is adjusted so the perspective matches the physical screen.

This is not a volumetric display. It is a single-viewpoint projection system that presents one viewpoint at a time on a standard monitor.

## Coordinate convention

Use meters for scene geometry.

- Physical screen lies in the plane z = 0.
- Screen center is at (0, 0, 0).
- Screen width is W, height is H.
- Eye is at (ex, ey, d) in front of the screen, with d > 0.
- Virtual objects are placed behind the screen at negative z values.
- The camera looks down its local negative z axis and stays perpendicular to the screen.

## Frustum equations

For near plane distance n:

left = n * ((-W/2 - ex) / d)
right = n * ((W/2 - ex) / d)
bottom = n * ((-H/2 - ey) / d)
top = n * ((H/2 - ey) / d)

These are asymmetric bounds because the eye is not centered on the screen.

## Three.js usage

Use the camera's position and custom projection matrix:

```ts
camera.position.set(ex, ey, d)
camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far)
camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
camera.updateMatrixWorld()
```

Do not call `camera.updateProjectionMatrix()` after setting the custom matrix. That rebuilds a symmetric frustum and overwrites the off-axis projection.

## MVP checklist

- Full-window WebGL canvas
- Visible virtual screen frame
- Simple 3D room or floor scene
- Eye sliders for ex, ey, and d
- Symmetric vs off-axis toggle
- Recenter/reset control

## Acceptance checks

- Centered eye should look like regular perspective.
- Moving eye left/right/up/down creates parallax in the expected direction.
- The screen frame remains visually anchored to the display edges.
- Changing eye-to-screen distance changes perspective smoothly.
- Symmetric/off-axis comparison is visually clear.
- Resizing the browser does not break the render.

## Calibration and limits

- Measure active screen width and height, not bezel size.
- Webcam tracking gives normalized image coordinates, not millimeters.
- Start with a fixed viewing distance and manual motion scaling.
- Browser camera access requires localhost or HTTPS.
- A single normal monitor can show one viewpoint at a time; it cannot provide true binocular stereo or open-air imagery.

## Good reference papers and docs

- Zellmann & Amstutz, "A Practical Guide to Implementing Off-Axis Stereo Projection"
  https://arxiv.org/abs/2311.05887
- DisplayXR Kooima projection math reference
  https://github.com/DisplayXR/displayxr-common/blob/main/docs-math-reference.md
- Three.js PerspectiveCamera docs
  https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
- Three.js Matrix4.makePerspective docs
  https://threejs.org/docs/#api/en/math/Matrix4
- MediaPipe Face Landmarker (future webcam tracking)
  https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js

## Suggested early implementation order

1. Render a simple static scene.
2. Add a screen frame and floor grid.
3. Add eye controls for ex, ey, d.
4. Implement off-axis frustum math in a helper function.
5. Compare symmetric and off-axis mode.
6. Add webcam tracking only after the manual projection is verified.

## Useful mental model

The screen is the window, the eye is the camera location, and the frustum is shaped to match the real-world viewing angle of the screen. The goal is to make the digital scene appear as though it were seen through that physical screen from the viewer's actual eye position.
