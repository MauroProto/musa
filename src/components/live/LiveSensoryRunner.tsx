import { useEffect, useRef } from 'react';
import { useSensoryPlayer } from '../../hooks/useSensoryPlayer';
import { energyValueAt } from '../../lib/sensory-score';
import { PocketStage } from './PocketStage';
import type { SetlistEntry } from '../../lib/live-shows';

/**
 * Drives one live song. It mounts the real sensory engine for the active track
 * (silent — the music is in the room), auto-plays it, fires the genuine haptic
 * score, and renders the pocket visualization. When the song's preview window
 * elapses it reports back so the concert clock can advance.
 *
 * Re-mounted per song (keyed by the caller), so unmounting cleanly stops the
 * haptics between songs.
 */
export function LiveSensoryRunner({
  entry,
  onSongEnded,
}: {
  entry: SetlistEntry;
  onSongEnded: () => void;
}) {
  const player = useSensoryPlayer(
    entry.trackId,
    { durationMs: entry.durationMs },
    null,
    { strengthOverride: 'strong' },
  );

  const { status, play } = player;
  const endedRef = useRef(false);

  // Auto-play once the score is ready.
  useEffect(() => {
    if (status === 'ready') play();
  }, [status, play]);

  // Advance when the preview window elapses (keeps the demo concert short).
  useEffect(() => {
    if (endedRef.current) return;
    if (player.currentMs >= entry.previewMs || (player.durationMs > 0 && player.currentMs >= player.durationMs)) {
      endedRef.current = true;
      onSongEnded();
    }
  }, [player.currentMs, player.durationMs, entry.previewMs, onSongEnded]);

  const vocal = vocalLevel(player.score?.vocalEnergy, player.currentMs);
  const energy = player.score ? energyValueAt(player.score.energy, player.currentMs) : 0.4;
  const chorusMsAway =
    player.nextChorusInMs !== null && player.nextChorusInMs <= 12000 ? player.nextChorusInMs : null;

  return (
    <PocketStage
      title={entry.title}
      artist={entry.artist}
      note={entry.note}
      vocal={vocal}
      energy={energy}
      beat={player.beatPulse}
      cueType={player.cue?.type}
      cueId={player.cue?.id}
      chorusMsAway={chorusMsAway}
    />
  );
}

function vocalLevel(vocalEnergy: { t: number; value: number }[] | undefined, currentMs: number): number {
  if (vocalEnergy && vocalEnergy.length > 0) return energyValueAt(vocalEnergy, currentMs);
  return 0.4;
}
