type FlatRow = Record<string, unknown>;

type ValueExtentOptions = {
	/** Sum categories per row (stacked bars) instead of taking raw values. */
	stacked?: boolean;
	/** Categories plotted below zero (diverging bars). */
	negativeCategories?: string[];
};

function toFiniteNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}

/**
 * Zero-anchored data extent for a linear value scale, used as the fallback
 * when no explicit axis domain is configured. Bar-family charts pass their
 * config domain straight to visx, which silently ignores `null` and leaves
 * d3's default `[0, 1]` — this provides a sensible data-derived domain
 * instead.
 *
 * @param flattenedData
 * @param categories
 * @param options
 */
export function getLinearValueDataExtent(
	flattenedData: FlatRow[] | undefined,
	categories: string[] | undefined,
	options: ValueExtentOptions = {}
): [number, number] {
	if (
		!Array.isArray(flattenedData) ||
		flattenedData.length === 0 ||
		!Array.isArray(categories) ||
		categories.length === 0
	) {
		return [0, 0];
	}

	const negative = new Set(options.negativeCategories ?? []);
	let min = 0;
	let max = 0;

	for (const row of flattenedData) {
		let positiveSum = 0;
		let negativeSum = 0;
		for (const category of categories) {
			const value = toFiniteNumber(row?.[category]);
			if (value === null) {
				continue;
			}
			const signed = negative.has(category) ? -Math.abs(value) : value;
			if (options.stacked) {
				if (signed >= 0) {
					positiveSum += signed;
				} else {
					negativeSum += signed;
				}
			} else {
				min = Math.min(min, signed);
				max = Math.max(max, signed);
			}
		}
		if (options.stacked) {
			min = Math.min(min, negativeSum);
			max = Math.max(max, positiveSum);
		}
	}

	return [min, max];
}
