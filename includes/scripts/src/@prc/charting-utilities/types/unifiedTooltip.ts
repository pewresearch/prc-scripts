export type UnifiedEntry = {
	category: string;
	/** The series' own value, never a stacked total. */
	value: number;
	/** Where the highlight node sits. Stacked charts pass a cumulative top. */
	py: number;
	color: string;
	/** Source flat row for arbitrary tooltip template tokens. */
	sourceRow?: Record<string, unknown>;
};

export type UnifiedColumn = {
	/** Pixel x of this column, plot-relative. */
	px: number;
	/** The row's x as the chart holds it — a number, string or Date. */
	xValue: any;
	/** Every series plotted here, sorted by value, descending. */
	entries: UnifiedEntry[];
	/** Topmost plotted pixel y. Equals `ruleBottom` when one series is present. */
	ruleTop: number;
	/** Bottommost plotted pixel y. */
	ruleBottom: number;
};
