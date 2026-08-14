import { scaleBand, scaleLinear } from '@visx/scale';
import type { FlatData } from '../types/flatData';
import type { SmallMultiplesPanel } from './facetDataByColumn';

export type ColumnBarRect = {
	key: string;
	x: number;
	y: number;
	width: number;
	height: number;
	value: number;
};

export type ComputeColumnBarRectsArgs = {
	rows: FlatData[];
	bandDomain: string[];
	yDomain: [number, number];
	plotWidth: number;
	plotHeight: number;
	/** Band padding (0–1), typically `bar.barGroupPadding`. */
	padding?: number;
};

type SeriesLike = { rows: FlatData[] };

/**
 * Shared categorical domain for column/bar small-multiples panels.
 * Accepts column panels or series arrays. Preserves first-seen order.
 */
export function resolveBandDomain(seriesList: SeriesLike[] | SmallMultiplesPanel[]): string[] {
	const seen = new Set<string>();
	const domain: string[] = [];
	for (const series of seriesList) {
		for (const row of series.rows) {
			const key = String(row.x);
			if (!seen.has(key)) {
				seen.add(key);
				domain.push(key);
			}
		}
	}
	return domain;
}

/**
 * Layout vertical column bars for one small-multiples panel.
 */
export function computeColumnBarRects({
	rows,
	bandDomain,
	yDomain,
	plotWidth,
	plotHeight,
	padding = 0.2,
}: ComputeColumnBarRectsArgs): ColumnBarRect[] {
	if (!bandDomain.length || plotWidth <= 0 || plotHeight <= 0) {
		return [];
	}

	const xScale = scaleBand<string>({
		domain: bandDomain,
		range: [0, plotWidth],
		padding: Math.max(0, Math.min(1, padding)),
	});

	const yScale = scaleLinear({
		domain: yDomain,
		range: [plotHeight, 0],
	});

	const y0 = yScale(0) ?? plotHeight;
	const bandwidth = xScale.bandwidth();

	const bars: ColumnBarRect[] = [];
	for (const row of rows) {
		const key = String(row.x);
		const barX = xScale(key);
		if (barX === undefined) {
			continue;
		}
		const value = Number(row.y);
		if (!Number.isFinite(value)) {
			continue;
		}
		const barY = yScale(value) ?? y0;
		const top = Math.min(barY, y0);
		const height = Math.abs(y0 - barY);
		bars.push({
			key,
			x: barX,
			y: top,
			width: bandwidth,
			height,
			value,
		});
	}
	return bars;
}
