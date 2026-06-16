# AGENTS.md

Project: **MUSA — Haptic Captions for Music** (Expo Router, universal iOS/Android/Web).

## Commands

- `npm run typecheck` — TypeScript check (`tsc --noEmit`). Run before claiming work is complete.
- `npm run test` — Sensory Score engine tests (`node --test`, runs `src/**/*.test.ts` via `--experimental-strip-types`). Tests are excluded from typecheck.
- `npm run lint` — `expo lint`.
- `npm run web` / `npm run ios` / `npm run android` — start Expo.

## Conventions

- All API keys are **server-side only**. Never prefix them with `EXPO_PUBLIC_` and never import `src/lib/api-server.ts`, `musixmatch.ts`, `lalal.ts`, or `server-env.ts` from client code (screens/components/hooks use `src/lib/api-client.ts` instead).
- API routes live in `src/app/api/<name>/+api.ts` and use the standard Web `Request`/`Response` (not `ExpoRequest`).
- The Sensory Score engine (`src/lib/sensory-score.ts`) is **pure and deterministic** — no React, no platform APIs. Keep it that way and add tests for any new behavior.
- Haptics: use `src/lib/haptics.ts` (`createHapticController` / `previewHaptic`). It handles native (`expo-haptics`) and web (`navigator.vibrate`) automatically.
- Do **not** persist Musixmatch lyrics/subtitles (Musicathon rule). Only user profile, preferences and `track_id` may be stored. Demo lyrics in `src/lib/fixtures.ts` are original/fictional.
