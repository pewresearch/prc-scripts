/* eslint-disable jsdoc/require-param */
import type { FlatData } from '../types/flatData';
import { getCustomLabelStyle } from '../utilities/helpers';

/**
 * Returns true when the author has manually positioned this label.
 */
export function hasAuthorLabelOverride(
	dataPoint: FlatData,
	category: string
): boolean {
	const customPos = dataPoint.__labelPositions?.[category];
	return (
		customPos !== null &&
		customPos !== undefined &&
		((customPos.dx !== null && customPos.dx !== undefined) ||
			(customPos.dy !== null && customPos.dy !== undefined))
	);
}

export function buildChartLabelId(
	parts: Array<string | number | Date | null | undefined>
): string {
	return parts
		.filter((part) => part !== null && part !== undefined && part !== '')
		.map((part) =>
			part instanceof Date ? part.toISOString() : String(part)
		)
		.join('::');
}

export function getLabelMaxWidth(
	dataPoint: FlatData,
	category: string,
	fallback = 0
): number {
	return getCustomLabelStyle(dataPoint, category)?.maxWidth ?? fallback;
}
