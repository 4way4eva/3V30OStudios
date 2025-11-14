# EVØLVERSE — Sabbath Interlock Protocol

Purpose
- Define the Sabbath Interlock as a regimen for system stillness, auditable rest, and background protection.
- When active, visible overscale/animations and non-essential broadcasts are paused; background monitoring and hedges remain active.

Sabbath semantics
- Mode: `SABBATH = "on" | "off"`
- When `on`:
  - UI and WebXR clients should mute non-essential motion, animations, and sound pulses.
  - Event ingestion continues; non-urgent actions are queued and auditable.
  - Grace hedges are doubled where applicable.
- When `off`: normal operations resume, queued actions may be processed.

How to toggle (manual)
- Use the provided script: `node scripts/toggle_sabbath.js on` or `node scripts/toggle_sabbath.js off`
- The script writes `data/sabbath_state.json` and (optionally) fires a signed notification to your WebXR server using the existing `scripts/notify-on-mint.js` helper.

Audit & governance
- Every toggle is recorded to `data/sabbath_state.json` (timestamp + actor if provided).
- Recommended CI/PR rule: toggles to `Sabbath.md` or changes to state logic require a two-signer approval (Gnosis / code-owner).

Integration notes
- WebXR client change: when it receives a `sabbath`-typed notification (via your broadcast protocol), it should:
  - Pause holo motion, freeze animation mixers, and mute audio_pulse.mp3.
  - Show a small overlay: `SABBATH MODE — Protected (since <timestamp>)`.
  - Keep websocket connected for administrative/unblock events.

Legal / safety reminder
- Sabbath mode is an operations control, not an access control. Do not use it to bypass security logs, audits, or required legal notices.

---