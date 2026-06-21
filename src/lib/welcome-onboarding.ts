import type { ListeningProfile } from './types.ts';

export const WELCOME_PROFILE_PICKER = {
  mode: 'grid',
  showHints: false,
  wrap: true,
} as const;

export function canEnterWelcome(profile: ListeningProfile | null): boolean {
  return profile !== null;
}

export function welcomeCtaLabel(profile: ListeningProfile | null, entering: boolean): string {
  if (entering) return 'Opening';
  return canEnterWelcome(profile) ? 'Enter MUSA' : 'Choose a profile';
}
