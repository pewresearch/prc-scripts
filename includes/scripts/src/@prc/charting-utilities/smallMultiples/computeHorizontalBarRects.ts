import { scaleBand, scaleLinear } from '@visx/scale';
import type { FlatData } from '../types/flatData';

export type HorizontalBarRect = {
	key: string;
	x: number;
	y: number;
	width: number;
	height: number;
	value: number;
};

export type ComputeHorizontalBarRectsArgs = {
	rows: FlatData[];
	bandDomain: string[];
	xDomain: [number, number];
	plotWidth: number;
	plotHeight: number;
	/** Band padding (0–1), typically `bar.barGroupPadding`. */
	padding?: number;
};

export type ComputeBarPanelHeightArgs = {
	bandCount: number;
	/** Target height per category row (px). */
	rowHeight?: number;
	titlePad?: number;
	bottomInset?: number;
	minPlotHeight?: number;
};

/**
 * Cell height for horizontal-bar panels: grows with category count so bars
 * stay readable when columns restack.
 */
export function computeBarPanelHeight({
	bandCount,
	rowHeight = 28,
	titlePad = 0,
	bottomInset = 0,
	minPlotHeight = 40,
}: ComputeBarPanelHeightArgs): number {
	const count = Math.max(0, Math.floor(bandCount) || 0);
	const plotHeight = Math.max(minPlotHeight, count * Math.max(0, rowHeight));
	return Math.max(0, titlePad) + plotHeight + Math.max(0, bottomInset);
}

/**
 * Layout horizontal bars for one small-multiples panel.
 * Categories (x) run on a vertical band scale; values (y) on a horizontal linear scale.
 */
export function computeHorizontalBarRects({
	rows,
	bandDomain,
	xDomain,
	plotWidth,
	plotHeight,
	padding = 0.2,
}: ComputeHorizontalBarRectsArgs): HorizontalBarRect[] {
	if (!bandDomain.length || plotWidth <= 0 || plotHeight <= 0) {
		return [];
	}

	const yScale = scaleBand<string>({
		domain: bandDomain,
		range: [0, plotHeight],
		padding: Math.max(0, Math.min(1, padding)),
	});

	const xScale = scaleLinear({
		domain: xDomain,
		range: [0, plotWidth],
	});

	const x0 = xScale(0) ?? 0;
	const bandwidth = yScale.bandwidth();

	const bars: HorizontalBarRect[] = [];
	for (const row of rows) {
		const key = String(row.x);
		const barY = yScale(key);
		if (barY === undefined) {
			continue;
		}
		const value = Number(row.y);
		if (!Number.isFinite(value)) {
			continue;
		}
		const barX = xScale(value) ?? x0;
		const left = Math.min(barX, x0);
		const width = Math.abs(barX - x0);
		bars.push({
			key,
			x: left,
			y: barY,
			width,
			height: bandwidth,
			value,
		});
	}
	return bars;
}
