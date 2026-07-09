/**
 * Shipped default palette for charting-utilities consumers (PRC-528 slice 10).
 *
 * Named palette catalogs (politics-main, religion-main, …) are per-site via the
 * chart-builder theme (`window.prcChartBuilderTheme.palettes`). Unseeded installs
 * use this single neutral series.
 */

import { NEUTRAL_SERIES_COLORS } from './shippedNeutralDefaults';

export const general = [...NEUTRAL_SERIES_COLORS];

export const colors = {
	general,
};
