# Hiro and Ghost AR prototype

## Custom Ghost marker

The original Hiro mode remains the default. The home page and original QR code
are unchanged. To test the new marker after publishing:

1. On your computer, open `marker.html?marker=ghost`. Keep the entire black
   square and its white outer margin visible.
2. On your phone, open `ar.html?marker=ghost`, or select **Ghost (custom)** in
   `ar.html` before tapping **Start camera**.
3. Point at the computer screen. Check acquisition, rotation, loss and recovery.
   Try **Show test cube** as well as the ghost overlay.
4. Reload the AR page and select **Hiro (original)** to compare tracking under
   the same lighting, distance and displayed marker size.

Publish `ar.html`, `ar.js`, `marker.html`, `assets/ghost.png`,
`assets/ghost-marker.png`, and `assets/ghost-marker.patt` together. The original
source artwork and `tools/build_ghost_marker.py` are not needed at runtime.

The generator uses Pillow to flatten the source artwork onto white, frame it,
and encode four 16-by-16 BGR orientations in ARToolKit's pattern format. Run
`python tools/build_ghost_marker.py` to regenerate both marker files together.
The inner pattern occupies half the black square's width, matching the default
AR.js pattern ratio of 0.5. Do not crop away the border or white outer margin.

The virtual ghost artwork remains the same in both tracking modes. The custom
Ghost marker still needs a real-phone tracking test; file validation alone does
not confirm recognition quality.

The existing `index.html` and QR code remain unchanged. The prototype uses
`ar.html`, `ar.js`, and `assets/ghost.png`. No npm installation or build step is
required. External libraries require an Internet connection.

## Important: open the AR page first

Hiro is a tracking marker, not a QR code. Pointing the phone's regular Camera app
at Hiro will not open a website or display a ghost.

1. Open the published `ar.html` page in Safari on iPhone or Chrome on Android.
2. Tap **Start camera** and allow camera access.
3. Keep that page open and point its live camera view at Hiro on a separate
   screen or a printed sheet.

The original QR code opens the original BOO! page, which does not yet contain a
link to the AR prototype. Open `ar.html` directly for this test.

## Publish and test

1. Commit the prototype files and push them to the branch configured for GitHub
   Pages. Do not change the domain, repository name, or existing QR destination.
2. Wait for the Pages deployment to succeed. Open the current website URL with
   `ar.html` appended after the final `/`.
3. Open [the marker display page](marker.html) on a separate screen, or print it.
   Start with a flat, matte marker approximately 10–12 cm wide. Keep a white
   margin around the entire black border. Avoid a black screen background that
   blends into the marker border.
4. On the phone, open the AR page over HTTPS in Safari or Chrome. Tap
   **Start camera** and grant camera access. Confirm that live video appears.
5. Frame the entire marker, initially from 30–60 cm away in good lighting.
   The ghost should appear. Tap **Show test cube** to check the pose in 3D.
6. Move and tilt the marker slowly: both objects should follow it. Hide the
   marker: the object should disappear. Reveal it: the object should reappear.
7. Test the marker on the chest, both phone orientations, and the party lighting.
   Creased fabric, glare, and darkness reduce tracking reliability.
8. Deny camera permission and check the recovery message. Check **Back to BOO!**
   and the original QR code: both should still open the original website.

The ghost is a transparent plane offset from the marker. It appears thin when
viewed edge-on, which is expected for a 2D image. It does not automatically face
 the camera, so it preserves the marker's rotation.

## Troubleshooting a missing AR overlay

- **Using the regular Camera app:** open `ar.html` in the browser first, then
  tap **Start camera**. Hiro alone cannot launch the experience.
- **No live camera video:** check HTTPS and browser camera permissions. Open the
  page directly in Safari or Chrome instead of a social app's embedded browser.
- **Still loading:** check the Internet connection and report the exact status
  message displayed on the page.
- **Camera ready, but no marker found:** show the whole marker with a white
  margin, improve the lighting, avoid glare, and move closer or farther away.
- **Marker found, but no ghost:** tap **Show test cube** and report whether the
  cube appears. Include the phone model, browser, and exact status message.
- **Old page after publishing:** wait for deployment, then reload the page.

For a desktop test, run `python -m http.server 8000` and open
`http://localhost:8000/ar.html`. An HTTP address on the local network is not
sufficient for phone camera access; use the published HTTPS website.

## Verification limits

Code checks do not replace tests with a real camera and marker. Confirm tracking
on both target mobile browsers before adding the AR button to the home page.
The user confirmed that Hiro tracking works when the full border is visible.

Documentation: https://ar-js-org.github.io/AR.js-Docs/marker-based/
