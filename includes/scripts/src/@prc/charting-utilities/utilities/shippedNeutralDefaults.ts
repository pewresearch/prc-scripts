/**
 * Generic shipped palette + accent defaults (PRC-528 slice 10).
 *
 * PRC-specific values live in chart-theme.json and the per-site theme option.
 * These pink → purple swatches are deliberately unlike PRC production colors so
 * unseeded / no-theme installs are visually obvious during testing.
 */

/** Default series colors for charts without a themed palette. */
export const NEUTRAL_SERIES_COLORS = [
	'#F687B3',
	'#ED64A6',
	'#D53F8C',
	'#B83280',
	'#9F7AEA',
	'#805AD5',
] as const;

/** Highlight / deselect accents when dataRender omits explicit colors. */
export const NEUTRAL_HIGHLIGHT_COLOR = '#FBB6CE';
export const NEUTRAL_DESELECTED_COLOR = '#E9D8FD';
