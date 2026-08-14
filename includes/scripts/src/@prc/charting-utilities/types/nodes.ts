export type NodeSizeScale = 'sqrt' | 'linear' | 'log';

export type Nodes = {
	pointSize: number;
	pointFill: string | 'inherit';
	/** Fill opacity for markers (0–1). Default 1. */
	pointFillOpacity?: number;
	pointStroke: string | 'inherit';
	pointStrokeWidth: number;
	pointCustomSize: any; // function(d) { return d; },
	/**
	 * Column key used for variable point radius (scatter, beeswarm).
	 * Empty/null = fixed `pointSize`. Same category pool as Group By.
	 */
	sizeCategory?: string | null;
	/** Interpolation used to map `sizeCategory` values to a radius. Default 'sqrt'. */
	sizeScale?: NodeSizeScale;
	/** Min radius (px) when `sizeCategory` is set. Default 4 — matches map.bubble.minRadius. */
	minPointSize?: number;
	/** Max radius (px) when `sizeCategory` is set. Default 24 — matches map.bubble.maxRadius. */
	maxPointSize?: number;
};
