/* eslint-disable jsdoc/require-param */
import type { FlatData } from '../types/flatData';
import type { Legend, LegendItemCustomization } from '../types/legend';

import type { DeclutterLabelInput } from '../types/labels';

export interface OnLineSeriesDeclutterInput extends DeclutterLabelInput {
	category: string;
}

export interface SeriesPixelPoint {
	px: number;
	py: number;
}

/**
 * Linearly interpolate a series' y pixel at a target x pixel.
 */
export function getSeriesYAtPixelX(
	points: SeriesPixelPoint[],
	targetPx: number
): number {
	if (points.length === 0) {
		return 0;
	}
	if (points.length === 1) {
		return points[0].py;
	}

	const sorted = [...points].sort((a, b) => a.px - b.px);

	if (targetPx <= sorted[0].px) {
		return sorted[0].py;
	}

	const last = sorted[sorted.length - 1];
	if (targetPx >= last.px) {
		return last.py;
	}

	for (let i = 0; i < sorted.length - 1; i++) {
		const a = sorted[i];
		const b = sorted[i + 1];
		if (targetPx >= a.px && targetPx <= b.px) {
			const span = b.px - a.px;
			const t = span === 0 ? 0 : (targetPx - a.px) / span;
			return a.py + t * (b.py - a.py);
		}
	}

	return last.py;
}

export function hasAuthorDirectLabelOverride(
	customEntry?: LegendItemCustomization
): boolean {
	return (
		(customEntry?.offsetX !== undefined && customEntry?.offsetX !== null) ||
		(customEntry?.offsetY !== undefined && customEntry?.offsetY !== null)
	);
}

/**
 * Scale factors for responsive direct-legend positioning — mirrors
 * `DraggableLabel`'s `chartInnerWidth / referenceInnerWidth` logic.
 */
export function getDirectLabelScaleFactors(
	chartInnerWidth: number,
	chartInnerHeight: number,
	layout: {
		width: number;
		height: number;
		padding: { left: number; right: number; top: number; bottom: number };
	}
): { scaleX: number; scaleY: number } {
	const referenceInnerWidth =
		layout.width - layout.padding.left - layout.padding.right;
	const referenceInnerHeight =
		layout.height - layout.padding.top - layout.padding.bottom;

	return {
		scaleX:
			chartInnerWidth && referenceInnerWidth
				? chartInnerWidth / referenceInnerWidth
				: 1,
		scaleY:
			chartInnerHeight && referenceInnerHeight
				? chartInnerHeight / referenceInnerHeight
				: 1,
	};
}

/**
 * Convert author drag offsets (chart-container pixels) to dx/dy from the on-line anchor.
 * Stored `offsetX` / `offsetY` are at the layout reference dimensions; scale into the
 * current rendered inner chart area before computing anchor-relative offsets.
 */
export function getDirectLabelOffsetFromCustom(
	customEntry: LegendItemCustomization | undefined,
	anchorX: number,
	anchorY: number,
	padding: { left: number; top: number },
	scales: { scaleX?: number; scaleY?: number } = {}
): { dx: number; dy: number } {
	if (!hasAuthorDirectLabelOverride(customEntry)) {
		return { dx: 0, dy: 0 };
	}

	const scaleX = scales.scaleX ?? 1;
	const scaleY = scales.scaleY ?? 1;

	let innerX = anchorX;
	if (customEntry?.offsetX !== undefined && customEntry?.offsetX !== null) {
		innerX = (customEntry.offsetX - padding.left) * scaleX;
	}

	let innerY = anchorY;
	if (customEntry?.offsetY !== undefined && customEntry?.offsetY !== null) {
		innerY = (customEntry.offsetY - padding.top) * scaleY;
	}

	return {
		dx: innerX - anchorX,
		dy: innerY - anchorY,
	};
}

export function buildOnLineSeriesLabelId(
	category: string,
	categoryIndex: number
): string {
	return `direct-series::${categoryIndex}::${category}`;
}

export function buildOnLineSeriesLabels({
	categories,
	flattenedData,
	legend,
	innerWidth,
	independentScale,
	dependentScale,
	getIndependentValue,
	padding,
	getSeriesDependentValue,
	scales = { scaleX: 1, scaleY: 1 },
}: {
	categories: string[];
	flattenedData: FlatData[];
	legend: Legend;
	innerWidth: number;
	independentScale: (value: any) => number;
	dependentScale: (value: any) => number;
	getIndependentValue: (d: FlatData) => any;
	padding: { left: number; top: number };
	/** When set, resolves the dependent-axis value per point (e.g. stacked cumulative top). */
	getSeriesDependentValue?: (
		d: FlatData,
		category: string,
		categoryIndex: number
	) => number;
	scales?: { scaleX?: number; scaleY?: number };
}): OnLineSeriesDeclutterInput[] {
	const anchorPx = innerWidth / 2;
	const customLabels = legend.customLabels ?? {};
	const inputs: OnLineSeriesDeclutterInput[] = [];

	categories.forEach((category, categoryIndex) => {
		const filteredData = flattenedData.filter(
			(d: FlatData) =>
				d[category] !== '' &&
				d[category] !== undefined &&
				d[category] !== null
		);
		if (filteredData.length === 0) {
			return;
		}

		const seriesPoints: SeriesPixelPoint[] = filteredData.map((d) => {
			const dependentValue = getSeriesDependentValue
				? getSeriesDependentValue(d, category, categoryIndex)
				: d[category];
			return {
				px: independentScale(getIndependentValue(d)),
				py: dependentScale(dependentValue),
			};
		});

		const anchorX = anchorPx;
		const anchorY = getSeriesYAtPixelX(seriesPoints, anchorPx);
		const customEntry = customLabels[category];
		const authorOffset = getDirectLabelOffsetFromCustom(
			customEntry,
			anchorX,
			anchorY,
			padding,
			scales
		);
		const rawText = customEntry?.text ?? category;

		inputs.push({
			category,
			id: buildOnLineSeriesLabelId(category, categoryIndex),
			x: anchorX,
			y: anchorY,
			text: rawText,
			fontSize: customEntry?.fontSize ?? legend.fontSize,
			fontFamily: customEntry?.fontFamily,
			fontWeight: customEntry?.fontWeight ?? legend.fontWeight,
			maxWidth: customEntry?.maxWidth ?? 0,
			textAnchor: 'middle',
			dominantBaseline: 'middle',
			defaultDx: authorOffset.dx,
			defaultDy: authorOffset.dy,
			locked: hasAuthorDirectLabelOverride(customEntry),
		});
	});

	return inputs;
}

/** Cumulative stacked value through `categoryIndex` for direct-series legend positioning. */
export function getStackedSeriesDependentValue(
	d: FlatData,
	categories: string[],
	categoryIndex: number
): number {
	return categories
		.slice(0, categoryIndex + 1)
		.reduce((acc, cat) => Number(acc) + Number(d[cat] ?? 0), 0);
}
