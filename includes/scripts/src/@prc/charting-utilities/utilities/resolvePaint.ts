import type { CategoryStyle } from '../types/colors';

export interface ResolvePaintArgs {
	defaults?: CategoryStyle;
	series?: CategoryStyle | null;
	custom?: CategoryStyle | null;
	segment?: CategoryStyle | null;
}

function definedFields(style: CategoryStyle | null | undefined): CategoryStyle {
	return Object.fromEntries(
		Object.entries(style ?? {}).filter(([, value]) => value !== undefined)
	) as CategoryStyle;
}

/**
 * Strip a series style down to the fields it may paint on a mark.
 *
 * A category's identity color already reaches the mark through `defaults`,
 * compiled into `config.colors` by `compileSeriesFills`. Letting the series
 * layer set `fill` a second time would repaint a white node with the series
 * color. `fillSource` is editor bookkeeping and never paints.
 * `pointStrokeWidth`, `pointSize`, `pointFill`, and `pointFillOpacity` reach
 * line nodes only, so they stay off the path, bar, and segment layers.
 * `label` is typography, not mark paint.
 *
 * @param style Per-series style.
 */
export function seriesPaintLayer(
	style: CategoryStyle | null | undefined
): CategoryStyle | undefined {
	if (!style) {
		return undefined;
	}

	const paint = { ...style };
	delete paint.fill;
	delete paint.fillSource;
	delete paint.pointStrokeWidth;
	delete paint.pointSize;
	delete paint.pointFill;
	delete paint.pointFillOpacity;
	delete paint.fillOpacity;
	delete paint.label;
	delete paint.labelsVisible;
	return paint;
}

export function resolvePaint({
	defaults,
	series,
	custom,
	segment,
}: ResolvePaintArgs): CategoryStyle {
	return {
		...definedFields(defaults),
		...definedFields(series),
		...definedFields(custom),
		...definedFields(segment),
	};
}

export function resolveLinePathPaint(
	line: { strokeWidth?: number; strokeDasharray?: string },
	seriesColor: string,
	seriesStyle?: CategoryStyle | null
): CategoryStyle {
	return resolvePaint({
		defaults: {
			stroke: seriesColor,
			strokeWidth: line.strokeWidth,
			strokeDasharray: line.strokeDasharray || undefined,
			opacity: 1,
		},
		series: seriesPaintLayer(seriesStyle),
	});
}
