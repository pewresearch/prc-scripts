import type { CategoryStyle } from '../types/colors';
import type { SegmentCustomStyle } from '../types/shapes';
import { resolvePaint, seriesPaintLayer } from './resolvePaint';

export type SegmentPaintDefaults = SegmentCustomStyle;
export type SegmentPaint = SegmentCustomStyle;

function normalizeKeyValue(value: unknown): string {
	if (value instanceof Date) {
		return value.toISOString();
	}
	return String(value);
}

/**
 * Canonical line-segment attribute key (`startX::endX::category`).
 *
 * @param startX   Segment start value.
 * @param endX     Segment end value.
 * @param category Series key.
 */
export function generateSegmentKey(
	startX: unknown,
	endX: unknown,
	category: string
): string {
	return `${normalizeKeyValue(startX)}::${normalizeKeyValue(endX)}::${category}`;
}

/**
 * Resolve per-segment stroke styles from shapes.segmentStyles + series defaults.
 *
 * @param custom   Per-segment style.
 * @param defaults Chart-level paint defaults.
 * @param series   Per-series style.
 */
export function resolveSegmentPaint(
	custom: SegmentPaint | null | undefined,
	defaults: SegmentPaintDefaults,
	series?: CategoryStyle | null
): SegmentPaint {
	const normalizedSegment = {
		...custom,
		stroke: custom?.stroke || undefined,
	};

	return resolvePaint({
		defaults: { opacity: 1, ...defaults },
		series: seriesPaintLayer(series),
		segment: normalizedSegment,
	});
}
