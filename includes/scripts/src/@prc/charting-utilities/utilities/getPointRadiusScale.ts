/**
 * Square-root point radius scaling for scatter (and similar) charts.
 *
 * Mirrors the world / USA bubble-map contract:
 * - domain [0, max(|value|)]
 * - range [minRadius, maxRadius] (defaults 4…24)
 * - scaleSqrt so perceived circle *area* is proportional to value
 */
import { scaleLinear, scaleLog, scaleSqrt } from '@visx/scale';
import type { NodeSizeScale } from '../types/nodes';

export function getMaxAbsColumnValue(
	data: Array<Record<string, unknown>>,
	column: string
): number {
	if (!column || !Array.isArray(data) || data.length === 0) {
		return 0;
	}
	return Math.max(
		0,
		...data.map((d) => {
			const v = d?.[column];
			const n = typeof v === 'number' ? v : parseFloat(v as string);
			return Number.isFinite(n) ? Math.abs(n) : 0;
		})
	);
}

// Smallest value greater than zero, used to floor a log domain. 0 if none.
export function getMinPositiveColumnValue(
	data: Array<Record<string, unknown>>,
	column: string
): number {
	if (!column || !Array.isArray(data) || data.length === 0) {
		return 0;
	}
	const positives = data
		.map((d) => {
			const v = d?.[column];
			return typeof v === 'number' ? v : parseFloat(v as string);
		})
		.filter((n) => Number.isFinite(n) && n > 0);

	return positives.length > 0 ? Math.min(...positives) : 0;
}

export function createPointRadiusScale({
	maxValue,
	minRadius = 4,
	maxRadius = 24,
	scaleType = 'sqrt',
	minValue,
}: {
	maxValue: number;
	minRadius?: number;
	maxRadius?: number;
	scaleType?: NodeSizeScale;
	/** Only consulted by the log scale, whose domain cannot include 0. */
	minValue?: number;
}): (value: number) => number {
	const domainMax = maxValue > 0 ? maxValue : 1;
	const range: [number, number] = [minRadius, maxRadius];

	if (scaleType === 'log') {
		// A log domain must stay strictly positive. Fall back to three decades
		// below the max so a single-value column still produces a usable ramp.
		const domainMin =
			minValue && minValue > 0 ? minValue : domainMax / 1000;
		const scale = scaleLog({
			domain: [domainMin, Math.max(domainMax, domainMin * 10)],
			range,
		});
		return (value: number) =>
			scale(Math.max(Math.abs(value), domainMin)) as number;
	}

	const scale =
		scaleType === 'linear'
			? scaleLinear({ domain: [0, domainMax], range })
			: scaleSqrt({ domain: [0, domainMax], range });

	return (value: number) => scale(Math.abs(value)) as number;
}

export function resolvePointRadius({
	d,
	sizeCategory,
	pointSize,
	radiusScale,
}: {
	d: Record<string, unknown>;
	sizeCategory?: string | null;
	pointSize: number;
	radiusScale?: ((value: number) => number) | null;
}): number {
	if (!sizeCategory || !radiusScale) {
		return pointSize;
	}
	const raw = d?.[sizeCategory];
	const n = typeof raw === 'number' ? raw : parseFloat(raw as string);
	if (!Number.isFinite(n)) {
		return pointSize;
	}
	return radiusScale(n);
}
