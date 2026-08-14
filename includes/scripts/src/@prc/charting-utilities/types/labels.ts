/**
 * Style overrides for individual label customization
 */
export interface LabelStyleOverride {
	color?: string;
	fontWeight?: string | number;
	fontSize?: number;
	fontStyle?: 'normal' | 'italic' | 'underline' | 'strikethrough';
	fontFamily?: string;
	maxWidth?: number;
}

/**
 * Position offset for a label
 */
export interface LabelPositionOffset {
	dx: number;
	dy: number;
}

/**
 * Per-data-point label customizations stored in block attributes.
 * Keys are formatted as "xValue::category" (e.g., "2020::Democrats")
 */
export interface LabelCustomizations {
	customPositions?: Record<string, LabelPositionOffset>;
	customLabels?: Record<string, string>;
	customVisibility?: Record<string, boolean>;
	customStyles?: Record<string, LabelStyleOverride>;
}

/** Placement for first/last point labels on line-family charts. */
export type FirstLastLabelLayout = 'default' | 'outside';

export type Labels = {
	active: boolean;
	showFirstLastPointsOnly: boolean;
	/**
	 * How first and last point labels are placed on line / area / stacked-area charts.
	 * - `default` — base offset (0, 0); `labelPositionDX` / `labelPositionDY` apply as usual
	 * - `outside` — first base (-5, 0) with `textAnchor: 'end'`, last base (5, 0) with
	 *   `textAnchor: 'start'`; DX/DY still layer on top of those bases
	 */
	firstLastLabelLayout: FirstLastLabelLayout;
	color: 'inherit' | 'contrast' | 'black' | 'white';
	// altColor: 'white',
	fontWeight: number;
	fontSize: number;
	fontFamily: string;
	textAnchor: 'start' | 'middle' | 'end';
	labelPositionBar: 'inside' | 'outside' | 'center';
	labelCutoff: number;
	/**
	 * Values in [0, minDisplayValue) render as `<minDisplayValue` rather than
	 * rounding to zero. Null formats every value normally. Unrelated to
	 * `labelCutoff`, which decides whether a label is drawn at all.
	 */
	minDisplayValue: number | null;
	labelPositionDX: number;
	labelPositionDY: number;
	pieLabelRadius?: number;
	abbreviateValue: boolean;
	absoluteValue: boolean;
	truncateDecimal: boolean;
	toFixedDecimal: number;
	toLocaleString: boolean;
	labelUnit: string; //'%', '$', '€', '£', '¥'
	labelUnitPosition: 'start' | 'end';
	customLabelFormat?:
		| ((value: number | Date | string, category: string) => string)
		| null;
	/** When true, automatically nudge labels to reduce overlap (opt-in). */
	autoDeclutter?: boolean;
	/** Extra padding (px) between labels during auto-declutter. */
	declutterPadding?: number;
	/**
	 * When set, greedily omit labels whose anchors sit within this many pixels
	 * of a kept label. Keeps series names near their lines on dense charts.
	 */
	declutterOmitWithin?: number;
	/**
	 * When set, omit the remaining representative of a crowded cluster when
	 * its anchor is this close to the top or bottom plot edge.
	 */
	declutterOmitEdgeWithin?: number;
	/** When true, draw leader lines from anchor to displaced decluttered labels. */
	declutterLeaderLines?: boolean;
	/**
	 * When true, draw a contrasting outline (halo) behind every label so it
	 * stays legible when it sits atop a line or shape.
	 */
	textOutline?: boolean;
	/**
	 * How the text-outline halo color is chosen when `textOutline` is enabled.
	 * - `background` — uniform chart-background moat (best for labels over lines)
	 * - `contrast` — halo contrasts with each label's text fill (best inside bars)
	 * When unset, bar/pie/treemap charts default to `contrast`; others to `background`.
	 */
	textOutlineMode?: 'background' | 'contrast';
	// function(d) { return d; },
} & LabelCustomizations;

/** Auto-declutter engine types (labelLayout subsystem). */
export interface DeclutterLabelInput {
	id: string;
	/** Series/category key for consumers that coordinate related labels. */
	category?: string;
	x: number;
	y: number;
	text: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string | number;
	maxWidth?: number;
	textAnchor?: 'start' | 'middle' | 'end';
	dominantBaseline?: 'middle' | 'hanging' | 'auto' | 'central' | 'alphabetic';
	defaultDx?: number;
	defaultDy?: number;
	/** When true, keep defaultDx/defaultDy and skip simulation for this label. */
	locked?: boolean;
	/**
	 * When true, `omitWithin` may drop this label in a crowd. Reserve it for
	 * series names, which a reader can still recover from the colour key. Value
	 * labels are data and must be separated rather than deleted.
	 */
	omittable?: boolean;
}

export interface DeclutterOptions {
	padding?: number;
	/** Lock label x to anchor (line / horizontal bar vertical bump). */
	lockX?: boolean;
	/** Lock label y to anchor (vertical bar horizontal bump). */
	lockY?: boolean;
	iterations?: number;
	/** forceX anchor pull strength (default 0.3). */
	anchorStrengthX?: number;
	/** forceY anchor pull strength (default 0.6, or matched to X when lockY). */
	anchorStrengthY?: number;
	innerWidth?: number;
	innerHeight?: number;
	/**
	 * When set, greedily drop labels whose anchors sit within this many pixels
	 * of a kept label (top-to-bottom). Locked labels are always kept. Use this
	 * for dense multi-series charts where stacking would float names too far
	 * from their lines.
	 */
	omitWithin?: number;
	/**
	 * Omit the survivor of a crowded cluster when its anchor is this close to
	 * the top or bottom plot edge. Requires `omitWithin` and `innerHeight`.
	 */
	omitEdgeWithin?: number;
}

export interface DeclutterOffset {
	dx: number;
	dy: number;
	/** When true, the label should not be rendered. */
	hidden?: boolean;
}

export interface SimRectNode {
	id: string;
	x: number;
	y: number;
	x0: number;
	y0: number;
	vx: number;
	vy: number;
	fx: number | null;
	fy: number | null;
	width: number;
	height: number;
	bboxOffsetX: number;
	bboxOffsetY: number;
}
