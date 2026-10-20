import type { CategoryStyle } from '../types/colors';
import type { Bar } from '../types/bar';
import type { Nodes } from '../types/nodes';
import { resolveNodeShapeColors } from '../compute/nodes';
import { resolvePaint, seriesPaintLayer } from './resolvePaint';

type BarRectStrokeConfig = Pick<
	Bar,
	'hasRectStroke' | 'rectStrokeColor' | 'rectStrokeWidth'
>;

/**
 * Chart-level bar rectangle stroke defaults from `config.bar`.
 * @param barConfig
 */
export function barRectStrokeDefaults(
	barConfig?: BarRectStrokeConfig | null
): Pick<ShapePaintDefaults, 'stroke' | 'strokeWidth'> {
	if (!barConfig?.hasRectStroke) {
		return { stroke: undefined, strokeWidth: undefined };
	}

	const width = barConfig.rectStrokeWidth ?? 1;
	if (width <= 0) {
		return { stroke: undefined, strokeWidth: undefined };
	}

	return {
		stroke: barConfig.rectStrokeColor,
		strokeWidth: width,
	};
}

function seriesPaintWithoutStroke(
	seriesStyle: ShapePaint | null | undefined
): ShapePaint | null | undefined {
	const series = seriesPaintLayer(seriesStyle);
	if (!series) {
		return undefined;
	}

	const { stroke, strokeWidth, strokeOpacity, strokeDasharray, ...rest } =
		series;

	return Object.keys(rest).length > 0 ? rest : undefined;
}

export type ShapePaintDefaults = CategoryStyle;
export type ShapePaint = CategoryStyle;

/**
 * Resolve mark fill/stroke/opacity from chart, series, and custom styles.
 * Matches Line / Bar / Pie paint resolution.
 *
 * @param custom   Per-mark style.
 * @param defaults Chart defaults.
 * @param series   Per-series style.
 */
export function resolveShapePaint(
	custom: ShapePaint | null | undefined,
	defaults: ShapePaintDefaults,
	series?: ShapePaint | null
): ShapePaint {
	const inheritedOpacity = series?.opacity ?? defaults.opacity ?? 1;
	const customFill = custom?.fill || undefined;
	const normalizedCustom = {
		...custom,
		fill: customFill,
		stroke: custom?.stroke || undefined,
	};
	const paint = resolvePaint({
		defaults,
		series: seriesPaintLayer(series),
		custom: normalizedCustom,
	});

	if (customFill !== undefined && custom?.pattern === undefined) {
		delete paint.pattern;
	}

	return {
		...paint,
		opacity: (custom?.opacity ?? 1) * inheritedOpacity,
	};
}

/**
 * Resolve a line marker from node defaults, series style, and the mark popover.
 *
 * @param nodes       Chart node defaults.
 * @param seriesColor Resolved series color.
 * @param seriesStyle Per-series style.
 * @param custom      Per-mark popover style.
 */
export function resolvePointPaint(
	nodes: Nodes,
	seriesColor: string,
	seriesStyle?: ShapePaint | null,
	custom?: ShapePaint | null
): ShapePaint {
	const pointFill =
		custom?.pointFill ?? seriesStyle?.pointFill ?? nodes.pointFill;
	const { fill, stroke } = resolveNodeShapeColors(
		{ ...nodes, pointFill },
		seriesColor
	);
	const series = { ...(seriesPaintLayer(seriesStyle) ?? {}) };
	delete series.strokeWidth;

	const paint = resolveShapePaint(
		custom,
		{
			fill,
			stroke,
			strokeWidth: nodes.pointStrokeWidth,
			opacity: 1,
		},
		{
			...series,
			...(seriesStyle?.pointStrokeWidth !== undefined
				? { strokeWidth: seriesStyle.pointStrokeWidth }
				: {}),
		}
	);

	return {
		...paint,
		fillOpacity:
			custom?.pointFillOpacity ??
			seriesStyle?.pointFillOpacity ??
			nodes.pointFillOpacity ??
			1,
	};
}

/**
 * Resolve a bar from compiled fill, series style, and the mark popover.
 *
 * Identity fill already lives in `defaults.fill` via `compileSeriesFills`.
 *
 * @param defaults    Chart bar defaults, including compiled fill.
 * @param seriesStyle Per-series style.
 * @param custom      Per-mark popover style.
 * @param barConfig
 */
export function resolveBarPaint(
	defaults: ShapePaintDefaults,
	seriesStyle?: ShapePaint | null,
	custom?: ShapePaint | null,
	barConfig?: BarRectStrokeConfig | null
): ShapePaint {
	if (!barConfig) {
		return resolveShapePaint(
			custom,
			{ opacity: 1, ...defaults },
			seriesStyle
		);
	}

	const chartStroke = barRectStrokeDefaults(barConfig);
	const chartStrokeActive = chartStroke.stroke !== undefined;
	const mergedDefaults = {
		opacity: 1,
		...defaults,
		...chartStroke,
	};
	const series = chartStrokeActive
		? seriesStyle
		: seriesPaintWithoutStroke(seriesStyle);

	return resolveShapePaint(custom, mergedDefaults, series);
}

/**
 * Resolve a diverging secondary bar from its global defaults, legacy
 * per-category style, and the shared series style.
 *
 * The legacy map remains the middle layer until published charts migrate.
 * `seriesStyles` is the current authoring surface and therefore wins.
 *
 * @param defaults    Global secondary bar style.
 * @param legacyStyle Legacy per-category override.
 * @param seriesStyle Shared per-series override.
 */
export function resolveDivergingSecondaryPaint(
	defaults: ShapePaintDefaults,
	legacyStyle?: ShapePaint | null,
	seriesStyle?: ShapePaint | null
): ShapePaint {
	return resolvePaint({
		defaults,
		series: legacyStyle,
		custom: seriesStyle,
	});
}
