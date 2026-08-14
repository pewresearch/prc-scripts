import { UnifiedColumn, UnifiedEntry } from '../types/unifiedTooltip';

export type BuildUnifiedTooltipColumnsOptions = {
	rows: any[];
	categories: string[];
	getX: (row: any) => any;
	toPixelX: (x: any) => number;
	/** Value to pixel y. Stacked charts pass the cumulative top instead. */
	toPixelY: (value: number, row: any, category: string) => number;
	getColor: (category: string, index: number) => string;
};

/**
 * Collect every series plotted at each x into a single column.
 *
 * @param options Rows, categories and the chart's pixel mappings.
 * @return One column per x that has at least one series plotted.
 */
export function buildUnifiedTooltipColumns(
	options: BuildUnifiedTooltipColumnsOptions
): UnifiedColumn[] {
	const { rows, categories, getX, toPixelX, toPixelY, getColor } = options;

	return rows
		.map((row) => {
			const entries: UnifiedEntry[] = [];

			categories.forEach((category, index) => {
				// Empty values coerce to 0, so they have to be rejected before
				// the cast. A real 0 is a value and must survive.
				const raw = row[category];
				if (null === raw || undefined === raw || '' === raw) {
					return;
				}
				const value = Number(raw);
				if (!Number.isFinite(value)) {
					return;
				}
				entries.push({
					category,
					value,
					py: toPixelY(value, row, category),
					color: getColor(category, index),
					sourceRow: row,
				});
			});

			const xValue = getX(row);
			const pixelYs = entries.map((entry) => entry.py);

			return {
				px: toPixelX(xValue),
				xValue,
				entries: entries.sort((a, b) => b.value - a.value),
				ruleTop: Math.min(...pixelYs),
				ruleBottom: Math.max(...pixelYs),
			};
		})
		.filter((column) => 0 < column.entries.length);
}
