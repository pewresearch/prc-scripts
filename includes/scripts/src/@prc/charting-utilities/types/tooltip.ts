import { dateFormat } from './dateFormat';

export type Tooltip = {
	active: boolean;
	/**
	 * `point` resolves one data point per hover. `unified` reports every series
	 * plotted at the hovered x. Optional so tooltip literals that do not spread
	 * `baseConfig.tooltip` still type-check.
	 */
	mode?: 'point' | 'unified';
	headerActive: boolean;
	headerValue: 'independentValue' | 'categoryValue';
	format: string | null;
	/**
	 * Rich HTML tooltip body. When non-null, takes precedence over `format`.
	 * Null keeps the legacy mustache `format` path for existing charts.
	 * Stored as a string on the nested `tooltip` object attribute so HTML can
	 * persist in the block comment JSON (same pattern as `customTooltips` bodies).
	 */
	template: string | null;
	offsetX: number;
	offsetY: number;
	abbreviateValue: boolean;
	absoluteValue: boolean;
	toFixedDecimal: number;
	/**
	 * When true, drop trailing zeros after rounding to `toFixedDecimal`.
	 * Default false so Decimal Places pads values (e.g. 20 → 20.0).
	 */
	truncateDecimal?: boolean;
	/**
	 * Values in [0, minDisplayValue) render as `<minDisplayValue` rather than
	 * rounding to zero. Null formats every value normally.
	 */
	minDisplayValue: number | null;
	toLocaleString: boolean;
	customFormat: any; // function(d) { return d; },
	rlsFormat: boolean;
	caretPosition: 'top' | 'left' | 'bottom' | 'right';
	dateFormat: dateFormat['format'];
	deemphasizeSiblings: boolean;
	deemphasizeOpacity: number;
	emphasizeStrokeActive: boolean;
	emphasizeStrokeColor: string;
	emphasizeStrokeWidth: number;
	style: {
		minWidth: number;
		maxWidth: number;
		maxHeight: number;
		minHeight: number;
		width: number | 'auto' | '100%';
		height: number | 'auto';
		fontSize: string | number;
		fontFamily: string;
		background: string;
		color: string;
		padding: string;
		border: string;
		borderRadius: string;
	};
};
