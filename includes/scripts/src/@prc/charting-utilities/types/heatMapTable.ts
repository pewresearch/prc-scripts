export type HeatMapTable = {
	/** Pixel gap between adjacent cells. */
	cellGap: number;
	/** Corner radius for each cell rect. */
	cellRadius: number;
	/** Fill for missing / non-numeric cells. */
	emptyFill: string;
	/** Minimum cell width when fitting the grid into available space (px). */
	minCellWidth: number;
	/** Minimum cell height when fitting the grid into available space (px). */
	minCellHeight: number;
};
