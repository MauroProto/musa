# MUSA handoff

Updated: 2026-06-19 (guided Android haptic demo)
Repo: `D:\GithubProjects\Musa`
Branch for this work: `codex-guided-haptic-demo`

## What this project is

MUSA is an Expo Router app for haptic captions for music. The core loop is:

1. Search or open a curated demo track.
2. Fetch synced lyrics server-side when available.
3. Build a deterministic Sensory Score from lyrics, stems, and authored moments.
4. Play visual captions plus native haptics; optional audio/stem isolation is a bonus, not required.

The hackathon demo track is **Dani California** by Red Hot Chili Peppers, Musixmatch `trackId = 95574135`.

## Current demo posture

- Android native is the source of truth for haptics.
- Expo Go remains useful for development.
- `eas.json` has a `preview` Android APK profile.
- The Dani guided demo works without the local API for haptics because native clients fall back to bundled generated stem analysis and non-lyric sensory captions.
- Real lyrics and optional stem audio still require a reachable API server.
- Raw LALAL stem MP3s are not committed.

## How to run

Fresh setup:

```powershell
npm install
Copy-Item .env.example .env
```

Add server-side keys to `.env` as available:

```text
MUSIXMATCH_API_KEY=...
LALAL_API_KEY=...
```

Do not prefix those with `EXPO_PUBLIC_`.

Expo Go / Android phone:

```powershell
npx expo start --host lan --clear
```

Then open:

```text
exp://<your-lan-ip>:8081
```

Web fallback:

```powershell
npm run web
```

Preview APK:

```powershell
npx eas build --profile preview --platform android
```

## Demo flow

1. Open `/demo`.
2. Tap **Dani California**.
3. The player opens with `guided=1`.
4. Set strength to **Strong** in `/calibrate` for the clearest phone demo.
5. Press play and hold the phone.
6. The guided chip walks through: drums intro, signature guitar riff, bass verse, build, chorus, bridge, guitar solo.
7. Use `/legend` to explain the tactile alphabet.
8. Use hidden `/tuner` only during internal phone tuning.

## Important files

- `src/lib/authored-screenplay.ts` - authored Dani moments.
- `src/lib/demo-guided.ts` - guided steps + non-lyric fallback captions.
- `src/lib/demo-tuning.ts` - pure tuning helpers for `/tuner`.
- `src/lib/haptic-sequence.ts` - haptic alphabet, including `guitar_riff`.
- `src/hooks/useSensoryPlayer.ts` - scheduler and optional authored override input.
- `src/app/player.tsx` - guided chip integration.
- `src/app/calibrate.tsx` and `src/app/legend.tsx` - language onboarding.
- `src/app/tuner.tsx` - hidden internal tuner.
- `src/lib/api-client.ts` - native offline Dani fallback.

## Verification

Run before claiming completion:

```powershell
npm test
npm run typecheck
npm run lint
```

Manual checks that matter:

- Expo Go opens the LAN URL.
- `/demo` opens Dani guided player.
- If API is unreachable, Dani still loads sensory captions and haptics.
- `guitar_riff` feels distinct from `guitar_strum`.
- `/calibrate` core patterns feel different in Strong mode.
- `/tuner` can jump to a moment, preview the cue, and display a snippet.

## Constraints

- Do not persist Musixmatch lyrics/subtitles.
- Do not commit `.env`.
- Do not commit raw LALAL stem MP3s.
- Audio/stem isolate mode requires a reachable `/api/audio` server with local stems.
- Browser/mobile web vibration is only a fallback; judge the haptics on native Android.