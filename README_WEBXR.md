````markdown
```markdown
# BLEUCHAIN WebXR + Node Server

This folder contains a WebXR-capable scene (Three.js + GLTF) and a minimal Node.js server that serves static files and broadcasts live "blockAdded" events via WebSocket.

Files
- public/webxr.html — entry page that loads the WebXR scene
- public/js/webxr_scene.js — Three.js WebXR scene, GLTF loader, websocket client
- assets/holo_layer.glb — hologram GLTF (keep in repo assets/)
- server/server.js — express static server + websocket (ws)
- server/package.json — node dependencies & scripts

Quick start (local)
1. Place assets/holo_layer.glb and existing assets/audio_pulse.mp3 next to the public folder.
2. Install and start:
   cd server
   npm install
   npm start
3. Open the scene:
   http://localhost:3000/webxr.html
4. Simulate a block event (from another process or curl):
   curl -X POST http://localhost:3000/api/block -H "Content-Type: application/json" -d '{"id":"ENFT-001","intensity":0.25}'
   The WebXR scene will receive the event and trigger a hologram pulse.

Notes & security
- For production, place the server behind TLS and use wss (secure websockets).
- Consider an authentication layer on /api/block to prevent unauthorized events.
- If hosting on GitHub Pages or static host only, use the Node server elsewhere for the websocket component.

Extensibility
- Add a route to accept signed ENFT mint notifications and validate them before broadcasting.
- Hook server/api/block to your mint pipeline (Hardhat deploy or event watcher) to broadcast live on-chain mints.
- Replace GLTF with a runtime-generated procedural holo for dynamic visuals.
````
