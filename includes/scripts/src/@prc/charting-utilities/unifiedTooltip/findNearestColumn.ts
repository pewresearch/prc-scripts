import { UnifiedColumn } from '../types/unifiedTooltip';

/**
 * Snap a pointer's pixel x to the column nearest it.
 *
 * There is no distance limit: the chart hides the tooltip when the pointer
 * leaves the plot, so inside the plot every position belongs to some column.
 *
 * @param columns Columns from `buildUnifiedTooltipColumns`.
 * @param px      Pointer x, plot-relative.
 * @return The nearest column, or null when there is nothing to snap to.
 */
export function findNearestColumn(
	columns: UnifiedColumn[],
	px: number
): UnifiedColumn | null {
	if (0 === columns.length || !Number.isFinite(px)) {
		return null;
	}

	// Strict `<` keeps the incumbent, so an exact tie resolves to the earlier
	// column rather than flickering on sub-pixel movement.
	return columns.reduce((nearest, column) =>
		Math.abs(column.px - px) < Math.abs(nearest.px - px) ? column : nearest
	);
}
