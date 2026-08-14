export type WaffleCellShape = 'square' | 'circle';

export type WaffleDisplayMode = 'whole' | 'portion';

/**
 * How cell pixel size relates to available plot space.
 * - fixed: always use authored cellSize (may overflow)
 * - auto: always fit the grid into available width/height
 * - clamp: use authored cellSize unless it overflows, then scale down
 */
export type WaffleCellSizeMode = 'fixed' | 'auto' | 'clamp';

export type Waffle = {
	cellShape: WaffleCellShape;
	cellGap: number;
	cellRadius: number;
	emptyFill: string;
	/** Number of cells across (grid width). */
	columns: number;
	/** Number of cells tall (grid height). */
	rows: number;
	/**
	 * Domain ceiling: what a full grid represents.
	 * Fill = value / max. When unset: portion defaults to 100; whole uses sum of values.
	 */
	max: number | null;
	/** Preferred cell size in px (used by fixed and clamp modes). */
	cellSize: number;
	cellSizeMode: WaffleCellSizeMode;
	displayMode: WaffleDisplayMode;
	/** @deprecated Use columns/rows. Kept for reading older blocks. */
	gridSize?: number;
};
