# MUSA

**Haptic captions for music.**

MUSA turns synced lyrics and song structure into a tactile, visual score for people who follow music through sight, touch, hearing aids, cochlear implants, or a phone in their hands.

> Lyrics you can read. Rhythm you can feel.

<p align="center">
  <a href="https://musa-landing-vercel.vercel.app">
    <img src="https://api.microlink.io/?url=https%3A%2F%2Fmusa-landing-vercel.vercel.app&amp;screenshot=true&amp;embed=screenshot.url" alt="MUSA landing homepage preview" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://musa-landing-vercel.vercel.app"><strong>Live landing</strong></a>
  ·
  <a href="https://github.com/MauroProto/musa"><strong>GitHub</strong></a>
  ·
  <a href="https://www.musixmatch.com/pro/api/musicathon"><strong>Musicathon</strong></a>
  ·
  <a href="https://www.musixmatch.com/pro/api/musicathon/rules"><strong>Rules</strong></a>
</p>

## Product

Most music accessibility stops at lyrics. Lyrics help, but they do not tell you when the drums enter, when a bass line carries the room, when a chorus is about to hit, or when a singer holds tension before releasing it.

MUSA adds a second layer: a **sensory score**. It reads lyric timing, stem energy, and authored musical moments, then translates them into large captions, visual rhythm, and meaningful haptic cues.

MUSA is not raw vibration. Each cue means something:

| Cue | Meaning |
| --- | --- |
| Short tap | A lyric line begins. |
| Long soft pulse | A vocal phrase is sustained. |
| Crisp repeated taps | Drums or percussion are driving the moment. |
| Lower rolling pulse | Bass is carrying the body of the song. |
| Patterned taps | A recognizable riff or instrumental hook is active. |
| Strong bloom | A chorus, drop, or emotional release is landing. |

## Demo

The hackathon demo is phone-first because real haptics need real hardware. Web is useful for the landing and visual fallback; the strongest experience is on Android through Expo or an APK preview.

Recommended judging flow:

1. Open the app on a phone.
2. Start the guided demo from the catalogue.
3. Choose a stronger haptic profile in calibration.
4. Press play and hold the phone.
5. Follow the guided chip as the song moves through intro, verse, build, chorus, and instrumental moments.

Demo tracks:

- **Ordinary** by Alex Warren, stem-backed guided score.
- **Dani California** by Red Hot Chili Peppers, Musixmatch `trackId = 95574135`.

The bundled demo captions are original, non-lyric sensory captions. MUSA does not persist Musixmatch lyrics or subtitles.

## Video Loops

| Moment | Link |
| --- | --- |
| Guided player and haptic captions | [Watch MP4](https://musa-landing-vercel.vercel.app/musa-scroll-1.mp4) |
| Haptic language and rhythm | [Watch MP4](https://musa-landing-vercel.vercel.app/musa-scroll-2.mp4) |
| Live concert mode | [Watch MP4](https://musa-landing-vercel.vercel.app/musa-scroll-3.mp4) |
| Landing card motion | [Watch MP4](https://musa-landing-vercel.vercel.app/musa-card-1.mp4) |

## How It Works

1. **Lyrics set the clock.** Synced lyric timing gives MUSA a readable timeline.
2. **Stems reveal structure.** Stem analysis helps identify drums, bass, vocals, guitar, and energy changes.
3. **The Sensory Score is generated.** A deterministic engine converts timing and structure into tactile events.
4. **The player performs it.** The phone shows captions and rhythm while native haptics fire in sync.
5. **Calibration adapts the feel.** Users can make patterns softer, clearer, or stronger.

## Built With

- Expo Router for iOS, Android, and web.
- React Native and React Native Web.
- `expo-haptics` for native tactile feedback.
- Expo API routes for server-side API access.
- Musixmatch for synced lyric metadata.
- LALAL.AI for stem separation in the demo workflow.

## Team

- [Mauro Protocassina](https://www.linkedin.com/in/mauroprotocassina/)
- [Ignacio Estevo](https://www.linkedin.com/in/ignacio-estevo/)

## Local Development

```bash
npm install
cp .env.example .env
npm run web
```

For phone testing:

```bash
npx expo start --host lan --clear
```

Server-side environment variables:

```bash
MUSIXMATCH_API_KEY=...
LALAL_API_KEY=...
```

Do not expose server keys with `EXPO_PUBLIC_`.

## Verification

```bash
npm run test
npm run typecheck
npm run lint
```

## Project Rules

- Do not commit `.env`.
- Do not persist Musixmatch lyrics or subtitles.
- Keep API keys server-side only.
- Keep `src/lib/sensory-score.ts` pure and deterministic.
- Use `src/lib/haptics.ts` for native and web haptic playback.
- Demo stem assets are included only for the MUSA hackathon/demo context and should not be reused or redistributed outside that scope.
