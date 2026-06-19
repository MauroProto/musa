import { SelectCard } from './controls';
import { Stack } from './ui';
import type { IconName } from './Icon';
import type { ListeningProfile } from '../lib/types';

export const PROFILE_OPTIONS: { id: ListeningProfile; title: string; hint: string; icon: IconName }[] = [
  { id: 'deaf_visual', title: 'Deaf', hint: 'I follow music mostly through sight and touch', icon: 'handTap' },
  { id: 'hard_of_hearing', title: 'Hard of hearing', hint: 'I catch some sound but lose the detail', icon: 'ear' },
  { id: 'cochlear_implant', title: 'Cochlear implant', hint: 'I hear rhythm and voice, miss texture', icon: 'chip' },
  { id: 'hearing_aid', title: 'Hearing aid', hint: 'Music can distort or go flat through my aid', icon: 'medical' },
  { id: 'feel_more', title: 'I want to feel more', hint: 'A fuller, multisensory way into any song', icon: 'feel' },
];

export function ProfilePicker({
  selected,
  onSelect,
  gap = 10,
}: {
  selected: ListeningProfile | null;
  onSelect: (p: ListeningProfile) => void;
  gap?: number;
}) {
  return (
    <Stack gap={gap}>
      {PROFILE_OPTIONS.map((p) => (
        <SelectCard
          key={p.id}
          title={p.title}
          hint={p.hint}
          icon={p.icon}
          active={selected === p.id}
          onPress={() => onSelect(p.id)}
        />
      ))}
    </Stack>
  );
}
