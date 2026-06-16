# MUSA — Haptic Captions for Music

> **Lyrics you can read. Rhythm you can feel. Music you can follow.**

MUSA turns **synced lyrics into a tactile and visual score** so Deaf, hard-of-hearing, cochlear-implant and hearing-aid users can follow a song through text, touch and rhythm — on a phone, without extra hardware.

It is not "another lyrics app" and it is not vibration by volume. MUSA is **semantic-haptic**: every vibration means something — a new lyric line, a chorus coming, an emotional sustain, a vocal pause.

Built for **Musicathon 2026**.

---

## How it works

```
Search a song
  → Musixmatch track.search
  → MUSA track.subtitle.get (synced LRC lyrics)
  → Sensory Score engine (timestamps → haptic + visual events)
  → Sensory Score screen: lyrics + pulse + energy + meaningful haptics
```

The engine (`src/lib/sensory-score.ts`) is pure, deterministic and unit-tested. It converts `SyncedLine[]` into:

- `events` — `line_start`, `sustain`, `pause`, `chorus_warning`, `chorus`, `section_end`
- `beats` — a BPM grid for the visual pulse (and optional beat haptics)
- `sections` — verse / chorus detection via repeated-lyric fingerprinting
- `energy` — per-time energy, estimated from lyric density or enriched by **LALAL.AI** stems

## Haptic language

| Musical event | Haptic | Visual |
| --- | --- | --- |
| New lyric line | Double tap | Line glows |
| Main pulse | Short tap | Pulsing dot |
| Emotional sustain | Soft long vibration | Expanded glow |
| Chorus coming | Three rising taps | Countdown appears |
| Chorus / drop | Strong hit | Screen blooms |
| Vocal pause | Haptic silence | Open space |

## Run it

```bash
npm install
cp .env.example .env   # add your MUSIXMATCH_API_KEY
npm run web            # web (dev server serves the API routes)
npm run ios            # iOS simulator / device
npm run android        # Android
```

Without a Musixmatch key, the app falls back to an **original demo catalogue** (`Slow Light`, `Underwater`) so the experience always works.

### Environment

| Var | Where | Purpose |
| --- | --- | --- |
| `MUSIXMATCH_API_KEY` | server only (`/.env`) | Real search + synced lyrics |
| `LALAL_API_KEY` | server only (optional) | Real stem-based energy envelopes |
| `EXPO_PUBLIC_API_BASE` | client (optional) | Public URL native clients use to reach the API routes (EAS Hosting URL) |

> **Musicathon rule respected:** Musixmatch content is used in real time only. No lyrics or subtitles are stored, cached or redistributed. The only persisted data is the user's profile, preferences and a `track_id`.

## Scripts

```bash
npm run test          # sensory-score engine tests (node:test)
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
npm run web|ios|android
```

## Architecture

- **Universal Expo Router app** (iOS · Android · Web, one codebase) — `src/app/*`
- **API routes** (`src/app/api/*/+api.ts`) keep API keys server-side: `/api/search`, `/api/lyrics`, `/api/stems`
- **Sensory Score engine** — `src/lib/sensory-score.ts` (pure, tested)
- **Cross-platform haptics** — `src/lib/haptics.ts` (`expo-haptics` on native, Web Vibration API on web)
- **Player hook** — `src/hooks/useSensoryPlayer.ts` (rAF timer, event scheduling, beat pulses)
- **Preferences** — `src/store/preferences.ts` (zustand + AsyncStorage, cross-platform)

## Project layout

```
src/
  app/
    _layout.tsx  welcome  profile-setup  search  player  calibrate  demo  legend
    api/  search  lyrics  stems   (+api.ts)
  components/   ui.tsx  player/{Pulse,EnergyBar,ChorusCountdown,LyricDisplay}.tsx
  hooks/        useSensoryPlayer.ts
  lib/          types  sensory-score (+test)  musixmatch  lalal  haptics  api-client  api-server  fixtures
  store/        preferences.ts
  constants/    theme  haptic-patterns
```

## Notes on LALAL.AI

Real stem separation needs the original audio (which Musixmatch doesn't provide) plus a LALAL key. `src/lib/lalal.ts` implements the full path (upload → split → ffmpeg RMS envelope). When audio or a key is absent, MUSA estimates energy **from the lyrics themselves** — which is the product's core semantic differentiator anyway.

## Sources

- [Musixmatch API](https://developer.musixmatch.com/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Apple Music Haptics](https://support.apple.com/en-il/guide/iphone/iphff2ceeb16/ios)
- [LALAL.AI](https://www.lalal.ai/)

---

*MUSA does not try to “fix” deafness. It tries to make music stop depending on hearing alone.*
