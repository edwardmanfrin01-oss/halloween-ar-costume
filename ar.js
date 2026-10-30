'use strict';

// Measurements in centimetres. Set markerSideCm to the printed BLACK square's side.
const costume = {
  image: 'assets/AR_layers/ghost.png',
  markerSideCm: 19,
  ghostHeightCm: 180,
  jumpscareDelayMs: 2500
};

const statusText = document.querySelector('#status');
const startButton = document.querySelector('#start');
const modeButton = document.querySelector('#mode');
let cameraFailed = false;
const scareOverlay = document.querySelector('#jumpscare');
const scareVideo = document.querySelector('#jumpscare-video');
const scarePlay = document.querySelector('#jumpscare-play');
let scareTimer;
let scarePlayed = false;
let scareClosed = false;
function cancelScareTimer() { clearTimeout(scareTimer); scareTimer = undefined; }
function closeScare() {
  cancelScareTimer();
  scareClosed = true;
  if (!scareVideo) return;
  scareVideo.pause();
  scareOverlay.hidden = true;
}
async function playScare() {
  if (scareClosed) return;
  scarePlay.hidden = true;
  try {
    await scareVideo.play();
  } catch {
    if (scareClosed) return;
    // Mobile browsers may only allow automatic playback without sound.
    scareVideo.muted = true;
    try { await scareVideo.play(); }
    catch { if (!scareClosed) scarePlay.hidden = false; }
  }
  if (scareClosed) scareVideo.pause();
}
if (scareVideo) {
  scareVideo.addEventListener('ended', closeScare);
  scareVideo.addEventListener('error', () => {
    closeScare();
    statusText.textContent = 'The ghost lost its video. Reload to try again.';
  });
  document.querySelector('#jumpscare-close').onclick = closeScare;
  scarePlay.onclick = () => { scareVideo.muted = false; void playScare(); };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !scareOverlay.hidden) closeScare();
  });
}
const markerChoice = document.querySelector('#marker-choice');
const markerLink = document.querySelector('#marker-link');
const markerOptions = {
  hiro: { name: 'Hiro', pattern: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/data/data/patt.hiro', page: 'marker.html' },
  ghost: { name: 'Ghost', pattern: 'assets/markers/ghost-marker.patt', page: 'marker.html?marker=ghost' },
  matrix: { name: 'Matrix Hamming 5', barcode: 5, page: 'marker.html?marker=matrix' }
};
const requestedMarker = new URLSearchParams(location.search).get('marker');
if (Object.hasOwn(markerOptions, requestedMarker) &&
    Array.from(markerChoice.options).some(option => option.value === requestedMarker)) {
  markerChoice.value = requestedMarker;
}
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
  closeScare();
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
  // Prime playback in the initial tap; never show or play the clip audibly here.
  if (scareVideo) {
    scareVideo.muted = true;
    scareVideo.play().then(() => {
      scareVideo.pause();
      scareVideo.currentTime = 0;
    }).catch(() => {});
  }
  markerChoice.disabled = true;
  const selectedMarker = markerOptions[markerChoice.value];
  statusText.textContent = 'Contacting the other side… their Wi-Fi sucks.';
  try {
    if (selectedMarker.pattern) {
      const patternResponse = await fetch(selectedMarker.pattern);
      if (!patternResponse.ok) throw new Error('Could not load the selected marker pattern. Check that all files have been published.');
    }
    // Pin both libraries so a new release cannot silently change the prototype.
    await loadScript('https://aframe.io/releases/1.6.0/aframe.min.js');
    await loadScript('https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js');
    const ghostImage = new Image();
    ghostImage.src = costume.image;
    await ghostImage.decode();
    // Measure transparent padding so ghostHeightCm describes the visible figure.
    const canvas = document.createElement('canvas');
    canvas.width = ghostImage.naturalWidth;
    canvas.height = ghostImage.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(ghostImage, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let firstRow = canvas.height, lastRow = -1;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] > 12) {
          firstRow = Math.min(firstRow, y);
          lastRow = y;
          break;
        }
      }
    }
    const visibleHeight = lastRow >= firstRow ? lastRow - firstRow + 1 : canvas.height;
    const planeHeight = costume.ghostHeightCm / costume.markerSideCm * canvas.height / visibleHeight;
    const planeWidth = planeHeight * canvas.width / canvas.height;

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
          <a-plane src="${costume.image}" width="${planeWidth}" height="${planeHeight}" rotation="-90 0 0"
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
      if (scareVideo && !cameraFailed && !scarePlayed && scareTimer === undefined) {
        scareTimer = setTimeout(() => {
          scareTimer = undefined;
          if (cameraFailed || scarePlayed) return;
          scarePlayed = true;
          scareClosed = false;
          scareVideo.currentTime = 0;
          scareVideo.muted = false;
          scareOverlay.hidden = false;
          document.querySelector('#jumpscare-close').focus();
          void playScare();
        }, costume.jumpscareDelayMs);
      }
    });
    marker.addEventListener('markerLost', () => {
      cancelScareTimer();
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
  closeScare();
  document.querySelectorAll('video').forEach(video => {
    video.srcObject?.getTracks().forEach(track => track.stop());
  });
});
