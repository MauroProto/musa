import { Redirect } from 'expo-router';
import { PRIMARY_GUIDED_TRACK } from '../../lib/fixtures';

export default function DemoRedirect() {
  return (
    <Redirect
      href={{
        pathname: '/player',
        params: {
          trackId: String(PRIMARY_GUIDED_TRACK.trackId),
          title: PRIMARY_GUIDED_TRACK.title,
          artist: PRIMARY_GUIDED_TRACK.artist,
          durationMs: String(PRIMARY_GUIDED_TRACK.durationMs ?? ''),
          guided: '1',
        },
      }}
    />
  );
}
