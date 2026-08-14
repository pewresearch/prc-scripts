export type SegmentPaintDefaults = {
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
	strokeDasharray?: string;
};

export type SegmentPaint = {
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
	strokeDasharray?: string;
};

function normalizeKeyValue(value: unknown): string {
	if (value instanceof Date) {
		return value.toISOString();
	}
	return String(value);
}

/** Canonical line-segment attribute key (`startX::endX::category`). */
export function generateSegmentKey(
	startX: unknown,
	endX: unknown,
	category: string
): string {
	return `${normalizeKeyValue(startX)}::${normalizeKeyValue(endX)}::${category}`;
}

/**
 * Resolve per-segment stroke styles from shapes.segmentStyles + series defaults.
 */
export function resolveSegmentPaint(
	custom: SegmentPaint | null | undefined,
	defaults: SegmentPaintDefaults
): SegmentPaint {
	return {
		stroke: custom?.stroke || defaults.stroke,
		strokeWidth: custom?.strokeWidth ?? defaults.strokeWidth,
		opacity: custom?.opacity ?? defaults.opacity ?? 1,
		strokeDasharray: custom?.strokeDasharray ?? defaults.strokeDasharray,
	};
}
