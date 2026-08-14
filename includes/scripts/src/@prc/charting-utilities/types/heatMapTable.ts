export type HeatMapTable = {
	/** Pixel gap between adjacent cells. */
	cellGap: number;
	/** Corner radius for each cell rect. */
	cellRadius: number;
	/** Render numeric value text inside each cell. */
	showValues: boolean;
	/** Fill for missing / non-numeric cells. */
	emptyFill: string;
	/** Extra inset between the independent axis line and the heat grid (px). */
	rowLabelWidth: number;
	/** Reserved height for the dependent axis when active (px). */
	columnHeaderHeight: number;
	/** Minimum cell width when fitting the grid into available space (px). */
	minCellWidth: number;
	/** Minimum cell height when fitting the grid into available space (px). */
	minCellHeight: number;
};
