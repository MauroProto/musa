# MUSA

**Haptic captions for music.**

MUSA turns synced lyrics and song structure into a readable, visual, and tactile score for people who follow music through sight, touch, hearing aids, cochlear implants, or a phone in their hands.

> Lyrics you can read. Rhythm you can feel.

<p align="center">
  <a href="https://musa-landing-vercel.vercel.app"><strong>Live landing</strong></a>
  ·
  <a href="https://www.youtube.com/watch?v=CLiNLzRrqWI"><strong>Demo video</strong></a>
  ·
  <a href="https://www.musixmatch.com/pro/api/musicathon"><strong>Musicathon</strong></a>
</p>

## What It Does

Most music accessibility stops at lyrics. MUSA adds the missing musical layer: rhythm, structure, pauses, energy, and tactile cues that help a listener follow what is happening in the song.

MUSA is not raw vibration. Each cue has meaning:

| Cue | Meaning |
| --- | --- |
| Short tap | A lyric line begins. |
| Soft pulse | A vocal phrase holds. |
| Repeated taps | Drums or percussion drive the moment. |
| Low pulse | Bass carries the body of the song. |
| Patterned taps | A riff or instrumental hook is active. |
| Strong bloom | A chorus, drop, or emotional release lands. |

## Demo

The demo is phone-first because real haptics need real hardware. The landing explains the idea, and the mobile app shows the full experience with captions, rhythm, and touch.

- Watch the demo video: [youtube.com/watch?v=CLiNLzRrqWI](https://www.youtube.com/watch?v=CLiNLzRrqWI)
- Open the landing: [musa-landing-vercel.vercel.app](https://musa-landing-vercel.vercel.app)
- Use the landing QR or mobile link to open the Expo Go build.

## How It Works

1. Synced lyrics set the timeline.
2. Song structure and stem energy add musical context.
3. MUSA generates a deterministic sensory score.
4. The phone performs it with captions, visual rhythm, and haptics.
5. Calibration adapts the strength and feel for each listener.

## Built With

- Expo Router for iOS, Android, and web.
- React Native and React Native Web.
- Native haptics through Expo.
- Musixmatch for synced lyric metadata.
- LALAL.AI for stem analysis in the demo workflow.

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

## Verification

```bash
npm run test
npm run typecheck
npm run lint
```

## Public Repo Notes

- Private planning, handoff, and internal research notes are intentionally not published in this repository.
- Do not commit `.env` files or API keys.
- API keys must stay server-side only.
- MUSA does not persist Musixmatch lyrics or subtitles.
