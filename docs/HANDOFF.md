# MUSA handoff

Updated: 2026-06-18 (post audio + authored screenplay)
Repo: `D:\GithubProjects\Musa`
Current pushed commit: `a3e6c77 Add Dani California haptic demo` (new work uncommitted on top)
Branch: `main`, synced with `origin/main` at the time of the prior handoff.

## What this project is

MUSA is an Expo Router app for "haptic captions for music". The core loop is:

1. Search a song through Musixmatch.
2. Fetch synced lyrics server-side.
3. Build a deterministic Sensory Score (now enriched by an **authored tactile screenplay** for the demo track).
4. Play lyrics, visual cues, native haptics, and — **optionally** — the real LALAL stem audio (full mix or isolated layer).

The hackathon demo track is **Dani California** by Red Hot Chili Peppers. It is prioritized in search as a curated demo score with Musixmatch `trackId = 95574135`.

## What changed in this session (big picture)

The product now delivers **"music you can understand"**, not just abstract pulses:

- **Audio is optional and off by default** (Deaf-first). The user can switch to **Full mix** (hear the song with haptics in sync) or **Isolate** a single stem — something Apple Music Haptics does not offer.
- **Authored screenplay** (`src/lib/authored-screenplay.ts`): the Dani California riff, verse, pre-chorus, chorus, bridge and solo are hand-curated with real labels and designed haptic cues. This was required because amplitude detection provably cannot recover musical meaning (the iconic intro riff plays at guitar RMS ~0.4–0.5 while later choruses hit 1.0, so any threshold either misses the riff or over-triggers).
- **Retuned stem analysis**: 100 ms resolution (was 500 ms) + onset (peak) detection per stem, so transient attacks (strums, fills) are caught even when RMS is low.
- **Audio = master clock**: when audio is on, the haptic scheduler reads `expo-audio.currentTime` for sample-accurate sync; rAF remains the fallback for silent mode.

## How to run

Fresh setup:

```powershell
npm install
Copy-Item .env.example .env
```

Then edit `.env` and add:

```text
MUSIXMATCH_API_KEY=...
```

Optional:

```text
LALAL_API_KEY=...
EXPO_PUBLIC_API_BASE=...
```

Important: API keys must stay server-side. Do not prefix `MUSIXMATCH_API_KEY` or `LALAL_API_KEY` with `EXPO_PUBLIC_`.

Start for Expo Go / Android phone:

```powershell
npx expo start --host lan --clear
```

Then open Expo Go and connect to:

```text
exp://<your-lan-ip>:8081
```

Last working LAN IP in this workspace was:

```text
exp://192.168.86.27:8081
```

If port `8081` is stuck on Windows:

```powershell
netstat -ano | findstr :8081
Stop-Process -Id <PID> -Force
```

Web fallback:

```powershell
npm run web
```

Browser/mobile web is useful for visual checks, but **real haptic testing must be done in Expo Go/native**.

## Verification commands

Run these before claiming work is done:

```powershell
npm test
npm run typecheck
npm run lint
```

Last verified before push:

```text
npm test -> 54 passed
npm run typecheck -> ok
npm run lint -> ok
```

The `/api/audio` route was also smoke-tested live (range request returns 206 + audio/mpeg + content-range over a 5 MB stem; 400 on bad stem; 404 on unsupported track).

## Demo flow

1. Open Expo Go.
2. Search `Dani California`.
3. Pick the curated result: `Dani California / Red Hot Chili Peppers`.
4. Set haptic strength to strong in calibration/settings.
5. (Optional) In Calibrate or the player, switch Audio to **Full mix** to hear the song, or **Isolate** to solo a stem (e.g. guitar). Default is **Silent** (Deaf-first).
6. Start playback.
7. Use the progress bar to scrub/seek.
8. In the player, the compact sensory panel shows the current tactile layer with **authored narration** ("The signature riff", "First chorus — full band hit"). Tap `Full` to expand.

The Dani California authored screenplay emphasises the moments that define the song (timings verified against real Musixmatch lyrics — vocals enter at 15580 ms, first chorus "California, rest in peace" at 56460 ms):

- `0–7.5s` drums count-in
- `7.5–15.5s` **the signature funk riff** (guitar_strum repeated every 760 ms) — previously invisible, now the first thing you feel
- `15.6–45s` bass walks under the verse vocal
- `45–56s` pre-chorus build
- `56.5–76.5s` first chorus — full band hit
- `137–156s` bridge ("Who knew")
- `190–230s` guitar solo

## Important files

Player and UX:

- `src/app/player.tsx`
- `src/components/player/SensoryPanel.tsx`
- `src/components/player/sensory-panel-copy.ts`
- `src/components/player/SeekBar.tsx`
- `src/components/player/AudioModeControl.tsx` (silent/mix/isolate + stem picker)
- `src/hooks/useSensoryPlayer.ts` (rAF scheduler; audio clock as master when active)
- `src/hooks/useStemAudio.ts` (expo-audio controller: 2 players, mix/isolate)

Haptics and score:

- `src/lib/sensory-score.ts` (pure; now merges authored screenplay)
- `src/lib/authored-screenplay.ts` (curated Dani California moments — PURE)
- `src/lib/stem-sensory.ts` (onset-aware transient detection)
- `src/lib/haptic-sequence.ts`
- `src/lib/haptics.ts`
- `src/lib/player-layer-state.ts`
- `src/lib/types.ts` (StemFrame + AuthoredMoment)

Audio (server-side streaming):

- `src/app/api/audio/+api.ts` (streams LALAL stems with HTTP Range)
- `src/lib/stem-assets.ts` (server-only trackId→stem file map)
- `src/lib/audio-client.ts` (client-safe AudioMode/StemKind + stream URL)

Demo/LALAL:

- `src/lib/generated/dani-california-stem-analysis.ts` (100 ms frames + onsets; ~597 KB)
- `scripts/analyze-lalal-stems.mjs` (windowMs=100, sampleRate=2000, RMS + peak)
- `src/lib/demo-score-tracks.ts`

API:

- `src/app/api/search/+api.ts`
- `src/app/api/lyrics/+api.ts`
- `src/app/api/stems/+api.ts`
- `src/lib/api-server.ts`
- `src/lib/api-client.ts`

Tests:

- `src/lib/authored-screenplay.test.ts` (authored override + riff repeat + chorus time)
- `src/lib/stem-sensory.test.ts` (onset detection)
- `src/lib/haptic-sequence.test.ts`
- `src/lib/player-layer-state.test.ts`
- `src/lib/player-time.test.ts`
- `src/lib/sensory-score.test.ts`

## Constraints

- Do not persist Musixmatch lyrics/subtitles. Musicathon rule: lyrics are real-time only.
- Do not commit `.env`.
- Do not commit raw LALAL stem MP3s. `assets/lalalai/*.mp3` is ignored. **Audio playback only works on a machine that has those stems locally**; if absent, the audio control is hidden (the app still works silently). Document this for anyone cloning the demo.
- Streaming copyrighted stems is for the hackathon demo only (real-time use of one track, equivalent to Spotify/Apple playback). Do not redistribute; gate behind the demo track id.
- Keep `src/lib/sensory-score.ts` and `src/lib/authored-screenplay.ts` pure/deterministic: no React, no platform APIs, no audio imports.
- Haptic calls should go through `src/lib/haptics.ts`.
- Audio calls go through `src/hooks/useStemAudio.ts` + `src/lib/audio-client.ts`. Never import `src/lib/stem-assets.ts` or `src/app/api/audio` from client code.
- Client code should use `src/lib/api-client.ts`, not server-only API modules.
- Expo SDK is currently `54` to match Expo Go compatibility. `expo-audio` was added (config plugin auto-registered in `app.json`).

## Known implementation details

- Android haptics use `expo-haptics` plus React Native `Vibration` fallback for stronger semantic cues.
- Web vibration is not reliable enough to judge the product. **Audio on web is also less reliable than native — judge the full experience in Expo Go.**
- The curated Dani result avoids accidentally loading the old Adele/Hello track id.
- Search prioritizes demo tracks, then Musixmatch results.
- The player can seek by tapping/dragging the progress bar.
- The full sensory panel is intentionally hidden by default because it was too large and chaotic.
- Authored screenplay moments override auto-detected moments of the same layer in their time window, and their cues win collisions by haptic type-priority.
- When `audioMode` is `mix`, two `expo-audio` players run (vocals + no_vocals instrumental); a 1 s passive re-sync keeps them aligned. `isolate` runs a single stem soloed.

## Suggested next-session focus

Use these skills/stances if available:

- `repo-deep-read` for orientation.
- `systematic-debugging` for haptics/device issues.
- `test-driven-development` for score/haptic behavior changes.
- `ui-animation` for player microinteractions.
- `critical-thinker` or `lateral-thinking` for product/demo decisions.

Good next tasks:

- **Smoke on Expo Go (real device)**: the one thing this session could not do. Verify (a) silent mode shows authored narration for the riff/chorus, (b) Full mix plays in sync with haptics, (c) Isolate solos each stem, (d) seek works with audio on. The screenplay timings are calibrated to real lyrics but the guitar solo window (190–230s) should be confirmed by ear.
- Tune Dani California on the actual Android phone: adjust `repeatEveryMs` / thresholds in `authored-screenplay.ts` and `stem-sensory.ts` by feel.
- Record the hackathon demo video from Expo Go, not browser. Lead with Silent mode (the Deaf-first differentiator), then switch to Isolate guitar (the Apple-can't-do-this moment).
- Decide whether to produce an APK/EAS build or rely on Expo Go + web fallback. Note: native clients need `EXPO_PUBLIC_API_BASE` set to reach `/api/audio`; without it audio fetches fail silently and the app falls back to silent.
- Improve README so it reflects the new audio toggle + authored screenplay.
- Add a one-tap "Demo Dani California" entry if judges need a faster path.
