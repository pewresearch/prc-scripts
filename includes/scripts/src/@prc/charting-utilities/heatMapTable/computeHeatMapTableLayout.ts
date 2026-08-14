export type ComputeHeatMapTableLayoutArgs = {
	columnCount: number;
	availableWidth: number;
	contentHeight: number;
	cellGap?: number;
	rowLabelWidth?: number;
	/** Reserved top band height for the dependent axis (0 when inactive). */
	columnHeaderHeight?: number;
	minCellWidth?: number;
};

export type HeatMapTableLayout = {
	cellWidth: number;
	cellGap: number;
	rowLabelWidth: number;
	columnHeaderHeight: number;
	gridWidth: number;
	totalWidth: number;
	totalHeight: number;
	/** Top-left of the colored cell at (col) with the given row Y. */
	cellPosition: (col: number, rowY: number) => { x: number; y: number };
	/** Anchor for a column header (centered above cell). */
	columnHeaderPosition: (col: number) => { x: number; y: number };
};

/**
 * Fit a labeled heat-map column grid into the available chart area.
 * Row Y positions come from the independent scale / group positioning in the chart component.
 */
export function computeHeatMapTableLayout({
	columnCount,
	availableWidth,
	contentHeight,
	cellGap = 0,
	rowLabelWidth = 0,
	columnHeaderHeight = 48,
	minCellWidth = 40,
}: ComputeHeatMapTableLayoutArgs): HeatMapTableLayout {
	const cols = Math.max(1, columnCount);
	const gap = Math.max(0, cellGap);
	const labelW = Math.max(0, rowLabelWidth);
	const headerH = Math.max(0, columnHeaderHeight);

	const gridAvailW = Math.max(0, availableWidth - labelW);
	const cellWidth = Math.max(
		minCellWidth,
		cols > 0
			? (gridAvailW - gap * Math.max(0, cols - 1)) / cols
			: minCellWidth
	);
	const gridWidth = cols * cellWidth + Math.max(0, cols - 1) * gap;
	const totalWidth = labelW + gridWidth;
	const totalHeight = headerH + Math.max(0, contentHeight);

	const cellPosition = (col: number, rowY: number) => ({
		x: labelW + col * (cellWidth + gap),
		y: rowY,
	});

	const columnHeaderPosition = (col: number) => ({
		x: labelW + col * (cellWidth + gap) + cellWidth / 2,
		y: headerH / 2,
	});

	return {
		cellWidth,
		cellGap: gap,
		rowLabelWidth: labelW,
		columnHeaderHeight: headerH,
		gridWidth,
		totalWidth,
		totalHeight,
		cellPosition,
		columnHeaderPosition,
	};
}
