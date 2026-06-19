# MUSA — Haptic Captions for Music

> **Lyrics you can read. Rhythm you can feel. Music you can follow.**

MUSA turns synced lyrics, song structure, and stem-derived cues into a tactile score for Deaf, hard-of-hearing, cochlear-implant and hearing-aid users. The hackathon demo is Android-first because real haptics need native hardware; web remains a visual fallback.

Built for **Musicathon 2026**.

## Demo Path

The judge-facing path is **Demo → Feel Dani California**. That route opens `/player?guided=1` and shows a compact guided chip for the key moments: drum count-in, signature guitar riff, verse bass, pre-chorus build, first chorus, bridge, and guitar solo.

If the API is unreachable, the Dani demo still works for native haptics using bundled non-lyric sensory captions plus the generated LALAL stem analysis. Real Musixmatch lyrics and optional stem audio require a reachable API server.

## Haptic Language

MUSA is semantic-haptic, not volume vibration. Core patterns:

| Layer | Meaning | Haptic |
| --- | --- | --- |
| Bass body | Physical low-end weight | Heavy low pulse |
| Drum attack | Percussion turns and fills | Fast dry taps |
| Signature riff | Recognizable guitar hook | Syncopated brushed taps |
| Chorus / drop | Shared payoff | Heavy hit + rebound |
| Mood shift | Emotional turn | Soft tone marker |

Use `/calibrate` to learn the patterns, `/legend` to review the full alphabet, and hidden `/tuner` to tune Dani timings on a real phone.

## Run Locally

```powershell
npm install
Copy-Item .env.example .env
npm run web
```

Add server-side keys to `.env` when available:

```text
MUSIXMATCH_API_KEY=...
LALAL_API_KEY=...
```

For Expo Go on Android:

```powershell
npx expo start --host lan --clear
```

Open Expo Go with:

```text
exp://<your-lan-ip>:8081
```

For a judge APK preview:

```powershell
npx eas build --profile preview --platform android
```

The preview profile builds an APK. It does not embed raw LALAL stem audio; audio/isolate mode still requires an API route that can stream local stems. Silent guided haptics work without that API.

## Environment

| Var | Where | Purpose |
| --- | --- | --- |
| `MUSIXMATCH_API_KEY` | server only | Real search + synced lyrics |
| `LALAL_API_KEY` | server only, optional | Stem-processing experiments |
| `EXPO_PUBLIC_API_BASE` | client, optional | LAN/deployed API base for native clients |

Never prefix server keys with `EXPO_PUBLIC_`.

## Scripts

```powershell
npm test
npm run typecheck
npm run lint
npm run web
npm run android
```

## Architecture

- Expo Router universal app in `src/app/*`.
- API routes in `src/app/api/*/+api.ts`; keys stay server-side.
- Pure deterministic Sensory Score engine in `src/lib/sensory-score.ts`.
- Authored Dani screenplay in `src/lib/authored-screenplay.ts`.
- Haptic alphabet in `src/lib/haptic-sequence.ts` and `src/constants/haptic-patterns.ts`.
- Guided demo and fallback captions in `src/lib/demo-guided.ts`.
- Internal timing overrides in `src/lib/demo-tuning.ts` and `/tuner`.

## Rules

- Do not persist Musixmatch lyrics/subtitles.
- Do not commit `.env`.
- Do not commit raw LALAL stem MP3s.
- Use `src/lib/haptics.ts` for haptic playback.
- Keep score/tuning helpers pure and tested.

*MUSA does not try to fix deafness. It tries to make music stop depending on hearing alone.*