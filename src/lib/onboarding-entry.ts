export const INITIAL_ENTRY_TARGET = '/welcome';
export const ENTER_MUSA_TARGET = '/search';

export function shouldCompleteOnboardingOnEnter(): boolean {
  return true;
}

export function enterMusaDelayMs(reducedMotion: boolean): number {
  return reducedMotion ? 80 : 260;
}
