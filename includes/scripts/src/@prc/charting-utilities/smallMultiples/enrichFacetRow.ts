import type { FlatData } from '../types/flatData';

/** Underscore-prefixed row fields are customization metadata, not series columns. */
export function isFacetMetaKey(key: string): boolean {
	return key.startsWith('__');
}

/**
 * Build a panel/series row from a wide or long-format source row.
 * Keeps tooltip/label customization bags so labels, tooltips, and editor
 * popovers can resolve against the series category key.
 */
export function enrichFacetRow(row: FlatData, seriesKey: string): FlatData {
	const enriched: FlatData = {
		x: row.x,
		y: Number(row[seriesKey]),
		[seriesKey]: Number(row[seriesKey]),
	};

	for (const key of Object.keys(row)) {
		if (isFacetMetaKey(key)) {
			enriched[key] = row[key];
		}
	}

	return enriched;
}
