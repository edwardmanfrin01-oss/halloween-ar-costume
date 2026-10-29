'use strict';

const statusText = document.querySelector('#status');
const startButton = document.querySelector('#start');
const modeButton = document.querySelector('#mode');
let cameraFailed = false;
const markerChoice = document.querySelector('#marker-choice');
const markerLink = document.querySelector('#marker-link');
const markerOptions = {
  hiro: { name: 'Hiro', pattern: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/data/data/patt.hiro', page: 'marker.html' },
  ghost: { name: 'Ghost', pattern: 'assets/ghost-marker.patt', page: 'marker.html?marker=ghost' },
  matrix: { name: 'Matrix Hamming 5', barcode: 5, page: 'marker.html?marker=matrix' }
};
const requestedMarker = new URLSearchParams(location.search).get('marker');
if (Object.hasOwn(markerOptions, requestedMarker)) markerChoice.value = requestedMarker;
function updateMarkerLink() { markerLink.href = markerOptions[markerChoice.value].page; }
markerChoice.addEventListener('change', updateMarkerLink);
updateMarkerLink();

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load AR libraries. Check your connection and reload.'));
    document.head.append(script);
  });
}

window.addEventListener('camera-init', () => {
  if (!cameraFailed) statusText.textContent = `Camera ready. Point at the entire ${markerOptions[markerChoice.value].name} marker. Reload to change markers.`;
});
window.addEventListener('camera-error', () => {
  cameraFailed = true;
  statusText.textContent = 'Camera unavailable. Allow camera access in your browser settings, close other camera apps, then reload. Use Safari or Chrome directly.';
  modeButton.hidden = true;
  startButton.hidden = false;
  startButton.disabled = false;
  startButton.textContent = 'Reload and retry';
  startButton.onclick = () => location.reload();
});

startButton.onclick = async () => {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = 'Camera access requires HTTPS (or localhost for desktop tests). Open the published HTTPS page in Safari or Chrome.';
    return;
  }
  startButton.disabled = true;
  markerChoice.disabled = true;
  const selectedMarker = markerOptions[markerChoice.value];
  statusText.textContent = 'Loading AR… then allow camera access.';
  try {
    if (selectedMarker.pattern) {
      const patternResponse = await fetch(selectedMarker.pattern);
      if (!patternResponse.ok) throw new Error('Could not load the selected marker pattern. Check that all files have been published.');
    }
    // Pin both libraries so a new release cannot silently change the prototype.
    await loadScript('https://aframe.io/releases/1.6.0/aframe.min.js');
    await loadScript('https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js');
    const ghostImage = new Image();
    ghostImage.src = 'assets/ghost.png';
    await ghostImage.decode();

    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
    scene.setAttribute('renderer', 'alpha: true; antialias: true');
    const detectionMode = selectedMarker.barcode !== undefined ? 'mono_and_matrix' : 'mono';
    scene.setAttribute('arjs', `sourceType: webcam; debugUIEnabled: false; detectionMode: ${detectionMode}; matrixCodeType: 3x3_HAMMING63; cameraParametersUrl: https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/data/data/camera_para.dat;`);
    const markerAttributes = selectedMarker.barcode !== undefined
      ? `type="barcode" value="${selectedMarker.barcode}"`
      : `type="pattern" url="${selectedMarker.pattern}"`;
    const animation = matchMedia('(prefers-reduced-motion: reduce)').matches ? '' :
      'animation="property: position; from: 0 0.12 0; to: 0 0.28 0; dur: 1500; dir: alternate; loop: true; easing: easeInOutSine"';
    // Hiro lies in XZ. Rotate the image to face out of the marker, including on a chest.
    scene.innerHTML = `
      <a-marker ${markerAttributes} emitevents="true">
        <a-entity id="ghost" position="0 0.12 0" ${animation}>
          <a-plane src="assets/ghost.png" width="1.35" height="1.65" rotation="-90 0 0"
            material="shader: flat; transparent: true; alphaTest: 0.05; side: double;"></a-plane>
        </a-entity>
        <a-box id="cube" position="0 0.5 0" material="color: #b4ff99; shader: flat; wireframe: true" visible="false"></a-box>
      </a-marker>
      <a-entity camera look-controls="enabled: false" wasd-controls="enabled: false"></a-entity>`;
    const marker = scene.querySelector('a-marker');
    let acquisitions = 0;
    let losses = 0;
    const metrics = document.querySelector('#metrics');
    function updateMetrics() {
      metrics.textContent = `${selectedMarker.name} · Acquisitions: ${acquisitions} · Losses: ${losses}`;
    }
    updateMetrics();
    marker.addEventListener('markerFound', () => {
      acquisitions++;
      updateMetrics();
      if (!cameraFailed) statusText.textContent = 'BOO! Marker found. Try tilting and rotating it.';
    });
    marker.addEventListener('markerLost', () => {
      if (acquisitions > 0) losses++;
      updateMetrics();
      if (!cameraFailed) statusText.textContent = `Marker lost. Bring the whole ${selectedMarker.name} marker back into view.`;
    });
    let showCube = false;
    modeButton.onclick = () => {
      showCube = !showCube;
      scene.querySelector('#ghost').setAttribute('visible', !showCube);
      scene.querySelector('#cube').setAttribute('visible', showCube);
      modeButton.textContent = showCube ? 'Show ghost' : 'Show test cube';
    };
    document.body.classList.add('running');
    startButton.hidden = true;
    modeButton.hidden = false;
    document.body.append(scene);
  } catch (error) {
    statusText.textContent = `${error.message} Reload the page to retry.`;
    startButton.disabled = false;
    startButton.textContent = 'Reload and retry';
    startButton.onclick = () => location.reload();
  }
};

window.addEventListener('pagehide', () => {
  document.querySelectorAll('video').forEach(video => {
    video.srcObject?.getTracks().forEach(track => track.stop());
  });
});
