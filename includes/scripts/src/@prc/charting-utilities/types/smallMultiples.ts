export type SmallMultiplesPanelType =
	| 'line'
	| 'column'
	| 'bar'
	| 'pie'
	| 'waffle';

export type SmallMultiplesAxisTreatment = 'minimal' | 'full';

export type SmallMultiplesEmphasisMode = 'own-series' | 'highlight';

export type SmallMultiplesGhost = {
	stroke: string;
	strokeWidth: number;
	opacity: number;
};

export type SmallMultiplesPanelGap = {
	x: number;
	y: number;
};

export type SmallMultiplesPanelTitle = {
	active: boolean;
	fontSize: number;
	fontWeight: number | string;
	fontFamily: string;
	fill: string;
	padding: number;
	textAlign?: string;
};

/** Per-panel title overrides (text / position / style). Not themeable. */
export type SmallMultiplesPanelTitleCustomization = {
	text?: string;
	offsetX?: number;
	offsetY?: number;
	color?: string;
	fontSize?: number | string;
	fontWeight?: number | string;
	fontStyle?: string;
	fontFamily?: string;
	maxWidth?: number;
	lineHeight?: number | string;
	textAlign?: string;
	letterSpacing?: number | string;
	textOutline?: boolean;
};

export type SmallMultiples = {
	panelType: SmallMultiplesPanelType;
	columns: number;
	/** Locked cell height (px). Total SVG height = f(panelHeight, rowCount, gapY). */
	panelHeight: number;
	/** Min cell width (px) before runtime column restack kicks in. */
	minPanelWidth: number;
	sharedScale: boolean;
	axisTreatment: SmallMultiplesAxisTreatment;
	emphasisMode: SmallMultiplesEmphasisMode;
	ghost: SmallMultiplesGhost;
	panelGap: SmallMultiplesPanelGap;
	panelTitle: SmallMultiplesPanelTitle;
	/** Editor/runtime customizations keyed by panel key (column or group value). */
	customTitles?: Record<string, SmallMultiplesPanelTitleCustomization>;
};
