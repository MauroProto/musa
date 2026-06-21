# MUSA handoff

Updated: 2026-06-21 (public Expo Go-safe judge demo)
Repo: `D:\GithubProjects\Musa`
Branch for this work: `main`

## What this project is

MUSA is an Expo Router app for haptic captions for music. The core loop is:

1. Search or open a curated demo track.
2. Fetch synced lyrics server-side when available.
3. Build a deterministic Sensory Score from lyrics, stems, and authored moments.
4. Play visual captions plus native haptics; audio/stem isolation is a bonus path for APK/dev builds, not the public Expo Go update.

The hackathon demo track is **Dani California** by Red Hot Chili Peppers, Musixmatch `trackId = 95574135`.

## Current demo posture

- Android native is the source of truth for haptics.
- Expo Go is the public judge path, but only for haptics/captions/visuals.
- `eas.json` has a `preview` Android APK profile.
- Dani and Ordinary work without the local API for haptics because native clients fall back to bundled generated stem analysis and non-lyric sensory captions.
- The Expo Go update intentionally does not import `expo-audio` or load the stem mixer. This keeps the update stable for judges who are not logged into the Expo owner account.
- Real Musixmatch lyrics require a reachable API server.
- Approved demo MP3/stem files exist in `assets/lalalai`, but EAS Update must not bundle MP3 assets.

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

Public Expo Go update for judges:

```powershell
npx eas-cli update --branch judges --platform all --message "MUSA judge Expo Go safe haptics"
```

Share a `qr.expo.dev/eas-update` QR/link for project `b42e4087-875c-4d04-92d0-f8f42eba92e4`, runtime `exposdk:54.0.0`, channel `judges`, and `slug=exp`. Do not share the Expo dashboard preview URL as the primary judge link.

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
- Expo Go public update opens without requiring the Expo owner account.
- `guitar_riff` feels distinct from `guitar_strum`.
- `/calibrate` core patterns feel different in Strong mode.
- `/tuner` can jump to a moment, preview the cue, and display a snippet.

## Constraints

- Do not persist Musixmatch lyrics/subtitles.
- Do not commit `.env`.
- Only commit audio that is explicitly approved for the demo.
- The public Expo Go update is haptics/captions only; audio/stem isolate mode requires an APK/dev build or a reachable `/api/audio`/static audio host.
- A bucket is not needed to fix Expo Go loading. Use a bucket later if you want reliable remote audio playback outside local dev/GitHub raw URLs.
- Browser/mobile web vibration is only a fallback; judge the haptics on native Android.
