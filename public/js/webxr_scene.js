// Minimal Three.js WebXR scene + GLTF hologram loader + WebSocket live updates
// Requires modern browser with WebXR (or will fallback to canvas render)

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

const status = document.getElementById('status');
const enterVrBtn = document.getElementById('enterVr');

let renderer, scene, camera, mixer, clock;
let holo = null;

async function init() {
  clock = new THREE.Clock();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 1.6, 3);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0x80b8ff, 1.2);
  dir.position.set(5,10,7);
  scene.add(dir);

  // Controls (non-XR)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.3, 0);
  controls.update();

  // Grid / floor subtle
  const grid = new THREE.GridHelper(10, 20, 0x0a73ff, 0x041229);
  grid.material.opacity = 0.08; grid.material.transparent = true;
  scene.add(grid);

  // Load GLTF hologram (assets/holo_layer.glb)
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync('/assets/holo_layer.glb');
    holo = gltf.scene;
    holo.traverse(n => {
      if (n.isMesh) {
        n.material.transparent = true;
        n.material.opacity = 0.95;
        n.material.emissive = n.material.emissive || new THREE.Color(0x0A73FF);
        n.material.emissiveIntensity = 0.7;
      }
    });
    holo.scale.setScalar(0.8);
    holo.position.set(0, 1.2, 0);
    scene.add(holo);
    mixer = gltf.animations && gltf.animations.length ? new THREE.AnimationMixer(holo) : null;
    if (mixer && gltf.animations[0]) mixer.clipAction(gltf.animations[0]).play();
  } catch (err) {
    console.warn('GLTF load failed (check assets/holo_layer.glb):', err);
  }

  window.addEventListener('resize', onWindowResize);
  animate();

  // WebXR Enter button
  enterVrBtn.addEventListener('click', async () => {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (supported) {
        renderer.xr.setSession(await navigator.xr.requestSession('immersive-vr'));
        status.innerText = 'WebXR session active (immersive-vr)';
      } else {
        status.innerText = 'WebXR not supported in this browser; using fallback canvas';
      }
    } else {
      status.innerText = 'WebXR not available — using canvas render';
    }
  });

  // Wire up websocket for live block events
  setupWebSocket();
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);
  // subtle hologram rotation
  if (holo) holo.rotation.y += 0.08 * dt;
  renderer.render(scene, camera);
}

// Live websocket (server runs on same origin, /ws)
function setupWebSocket() {
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${loc.host}/ws`;
  let ws;
  try {
    ws = new WebSocket(wsUrl);
  } catch (e) {
    status.innerText = 'WebSocket creation failed';
    return;
  }
  ws.onopen = () => {
    status.innerText = 'Connected — live';
  };
  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'blockAdded') {
        flashHoloPulse(msg.payload);
      }
    } catch (e) {
      console.warn('ws parse error', e);
    }
  };
  ws.onclose = () => status.innerText = 'Disconnected — websocket closed';
  ws.onerror = () => status.innerText = 'WebSocket error';
}

function flashHoloPulse(payload) {
  // small pulse animation on payload -> scale the hologram briefly
  if (!holo) return;
  const original = holo.scale.x;
  let intensity = Number(payload.intensity);
  if (!Number.isFinite(intensity) || intensity < 0) {
    intensity = 0.14;
  }
  const target = original * (1 + intensity);
  // tween (simple)
  let t = 0;
  const dur = 0.55;
  const step = () => {
    t += 0.016;
    const p = Math.min(1, t / dur);
    const scale = original + (target - original) * Math.sin(p * Math.PI);
    holo.scale.setScalar(scale);
    if (p < 1) requestAnimationFrame(step); else holo.scale.setScalar(original);
  };
  step();
}

// Start
init().catch(e => {
  console.error(e);
  status.innerText = 'Initialization error';
});
