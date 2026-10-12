# Head-Tracked Off-Axis Projection — Start Guide
**Last Updated:** 2026-10-09 (reconstructed after accidental deletion)

## Project Goal

Make a laptop or monitor behave like a window into a small 3D scene. As the viewer moves, update the virtual camera's position and asymmetric viewing frustum so the scene's perspective stays aligned with the physical screen.

This is a low-cost perception and projection prototype related to the volumetric-display mission. It is **not** a volumetric display: a single monitor presents one tracked viewpoint at a time and does not create open-air imagery or binocular stereo.

## MVP Scope

Build and test the projection with a simulated eye position first. Do not add webcam tracking until the projection behaves correctly under manual control.

The initial app should have:

- A full-screen WebGL canvas with a visible virtual screen frame.
- A simple room or scene containing a grid/floor and objects at several depths.
- Controls for eye position `(ex, ey)` and eye-to-screen distance `d`.
- A toggle between standard symmetric perspective and off-axis perspective.
- A recenter/reset control.

Keep the scene simple. The first milestone is projection correctness, not a polished art demo.

## Suggested Stack

- Vite + TypeScript for a small browser app.
- Three.js for rendering and custom projection matrices.
- Native HTML range inputs for the first controls; avoid adding a GUI framework.
- Later: MediaPipe Face Landmarker for browser-based face tracking.

## Project Structure

```text
src/
  main.ts                 # scene, renderer, animation loop
  offAxisProjection.ts    # screen geometry and asymmetric frustum math
  controls.ts             # eye sliders and perspective toggle
  style.css
index.html
README.md
```

## Coordinate Convention and Projection

Use meters for all geometry:

- Physical screen lies on the `z = 0` plane, centered at `(0, 0, 0)`.
- Screen width is `W`; screen height is `H`.
- Viewer eye is `(ex, ey, d)` in front of the screen; `d > 0`.
- The Three.js camera looks down its local negative Z axis and stays perpendicular to the screen. Move the camera to the eye position; do not rotate it to face the viewer.
- Virtual objects are placed behind the screen (negative Z).

For near-plane distance `n`, the asymmetric frustum bounds are:

$$
left = n \frac{-W/2 - e_x}{d}, \\
right = n \frac{W/2 - e_x}{d}
$$

$$
bottom = n \frac{-H/2 - e_y}{d}, \\
top = n \frac{H/2 - e_y}{d}
$$

In Three.js, set the camera position to `(ex, ey, d)` and update the projection matrix with the calculated bounds:

```ts
camera.position.set(ex, ey, d);
camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
camera.updateMatrixWorld();
```

Do not call the default `camera.updateProjectionMatrix()` after setting the custom matrix; it reconstructs a symmetric frustum and overwrites the off-axis projection. Keep the screen geometry and the display's measured physical dimensions consistent with the same coordinate frame.

## Build Order

### 1. Render a static scene

Create a full-window renderer, a camera, a floor/grid, a screen frame, and objects at near and far depths. Confirm that the render loop and resize behavior work before adding custom projection math.

### 2. Add a simulated eye

Use sliders for `ex`, `ey`, and `d`. Start near the center with a fixed display size and fixed distance. Move one variable at a time so the view change is easy to reason about.

### 3. Implement the asymmetric frustum

Put the bounds calculation in a pure helper function. On each control update, recalculate the frustum and camera position. Keep the camera orientation perpendicular to the screen.

### 4. Validate parallax

Test center, modest left/right, and modest up/down positions. The virtual screen frame should remain aligned with the physical screen while foreground and background objects shift relative to one another. Compare against the symmetric-perspective toggle.

### 5. Add webcam tracking

Only after manual controls pass the checks below, add MediaPipe Face Landmarker. Map face-center movement to a calibrated range of eye positions, smooth noisy movement, clamp extremes, and include a recenter control. Keep inference local in the browser.

## Acceptance Checks

- At the centered eye position, the off-axis view matches the expected centered view.
- Moving the eye left/right/up/down changes parallax in the corresponding direction.
- A screen-frame object remains visually anchored to the display edges as the simulated eye moves.
- Changing eye-to-screen distance changes perspective without producing unstable jumps.
- The symmetric/off-axis toggle produces a clear comparison.
- Resizing the browser does not break the renderer or the projection.

Capture a short screen recording from center and off-center viewpoints. If the virtual screen frame drifts, fix geometry, coordinate signs, or camera updates before adding tracking.

## Calibration and Limits

- Measure the active screen width and height, not the monitor's outer bezel.
- Webcam landmarks are normalized image coordinates, not calibrated millimeters. Treat them as relative motion until the camera, screen dimensions, and viewing distance are calibrated.
- Begin with a fixed viewing distance and manually adjustable motion scale. Avoid claiming physical accuracy until calibrated.
- Browser camera access requires `localhost` during development or HTTPS when deployed. Request permission explicitly and provide a no-camera fallback.
- A single ordinary monitor can render the correct perspective for only one tracked viewpoint at a time. It cannot provide binocular stereo, accommodation, or imagery in open air.

## References

- Zellmann & Amstutz, [A Practical Guide to Implementing Off-Axis Stereo Projection](https://arxiv.org/abs/2311.05887)
- [DisplayXR Kooima projection math reference](https://github.com/DisplayXR/displayxr-common/blob/main/docs-math-reference.md)
- Three.js [`Matrix4.makePerspective`](https://threejs.org/docs/pages/Matrix4.html)
- Google [MediaPipe Face Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js)
- MDN [`getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
