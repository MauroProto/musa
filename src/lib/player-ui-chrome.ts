export const SHOW_TACTILE_DETAILS_TOGGLE = false;
export const SHOW_TACTILE_LAYER_PILL = false;

export const PLAYER_DOCK_CHROME = {
  surface: 'integrated',
  elevation: 'none',
} as const;

export const PLAYER_TRANSPORT_CHROME = {
  buttonCount: 5,
  innerActions: ['previous_moment', 'next_moment'],
  outerActions: ['restart_track', 'replay_moment'],
} as const;

export const PLAYER_ALBUM_CHIP_CHROME = {
  visible: true,
  position: 'upper-lyrics',
  mobileSize: 86,
  radius: 0,
  showCopy: false,
} as const;

export const PLAYER_PROGRESS_DOT_CHROME = {
  color: '#D30000',
  size: 12,
  haloSize: 22,
} as const;

export const CHORUS_COUNTDOWN_CHROME = {
  position: 'above-tactile-status',
  surface: 'inline',
  dotVisible: false,
} as const;
