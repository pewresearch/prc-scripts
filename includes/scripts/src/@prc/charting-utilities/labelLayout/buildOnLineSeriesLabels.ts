/* eslint-disable jsdoc/require-param */
import type { FlatData } from '../types/flatData';
import type { Legend, LegendItemCustomization } from '../types/legend';

import { measureTextWidth } from './measureLabel';
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

const ANCHOR_SAMPLE_COUNT = 33;
/** Horizontal breathing room between two neighbouring direct labels. */
const ANCHOR_GAP = 8;

export interface PlacedAnchor {
	x: number;
	y: number;
	halfWidth: number;
	minClearance: number;
}

/**
 * Smallest vertical gap between this series and any other at pixel `x`.
 */
function getAnchorClearance(
	points: SeriesPixelPoint[],
	otherSeries: SeriesPixelPoint[][],
	x: number
): number {
	if (otherSeries.length === 0) {
		return Number.POSITIVE_INFINITY;
	}

	const y = getSeriesYAtPixelX(points, x);
	return otherSeries.reduce(
		(min, other) =>
			Math.min(min, Math.abs(y - getSeriesYAtPixelX(other, x))),
		Number.POSITIVE_INFINITY
	);
}

function collidesWithPlaced(
	x: number,
	y: number,
	halfWidth: number,
	minClearance: number,
	placed: PlacedAnchor[]
): boolean {
	return placed.some(
		(anchor) =>
			Math.abs(x - anchor.x) <
				halfWidth + anchor.halfWidth + ANCHOR_GAP &&
			Math.abs(y - anchor.y) < Math.max(minClearance, anchor.minClearance)
	);
}

/**
 * Choose where along a line to sit its name.
 *
 * Anchoring every series at the plot midpoint stacks all the names in one
 * column, so lines that merely converge mid-chart look hopelessly crowded and
 * the declutter pass drops labels that had room elsewhere. Sliding a label
 * along its own line instead keeps it readable and keeps it on its series.
 *
 * Movement is a last resort: a label holds the midpoint unless it would collide
 * with one already placed, then travels the shortest distance that clears it.
 * When nothing clears, it stays put and the declutter and omission passes take
 * over.
 */
export function pickSeriesAnchorX({
	points,
	otherSeries,
	placed,
	innerWidth,
	halfWidth,
	minClearance,
}: {
	points: SeriesPixelPoint[];
	otherSeries: SeriesPixelPoint[][];
	placed: PlacedAnchor[];
	innerWidth: number;
	halfWidth: number;
	minClearance: number;
}): number {
	const midpoint = innerWidth / 2;
	if (innerWidth <= 0) {
		return midpoint;
	}

	const margin = Math.min(halfWidth, midpoint);
	const span = Math.max(0, innerWidth - margin * 2);

	const candidates = [midpoint];
	for (let i = 0; i < ANCHOR_SAMPLE_COUNT; i++) {
		candidates.push(margin + (span * i) / (ANCHOR_SAMPLE_COUNT - 1));
	}

	let bestX: number | undefined;
	let bestDistance = Number.POSITIVE_INFINITY;
	let bestClearance = Number.NEGATIVE_INFINITY;

	for (const x of candidates) {
		const y = getSeriesYAtPixelX(points, x);
		if (collidesWithPlaced(x, y, halfWidth, minClearance, placed)) {
			continue;
		}

		// Only move to somewhere the series itself is legible. A line that never
		// separates from its neighbours cannot be rescued by sliding its name
		// along it — that just scatters unreadable names across the plot — so
		// leave it centred and let the omission pass drop it.
		const clearance = getAnchorClearance(points, otherSeries, x);
		if (clearance < minClearance) {
			continue;
		}

		const distance = Math.abs(x - midpoint);
		if (distance > bestDistance) {
			continue;
		}

		// Among equally close options, sit where the neighbouring lines are
		// furthest away so the name is easiest to trace back to its series.
		if (distance < bestDistance || clearance > bestClearance) {
			bestX = x;
			bestDistance = distance;
			bestClearance = clearance;
		}
	}

	return bestX ?? midpoint;
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
	crowdRadius = 0,
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
	/**
	 * Minimum vertical separation, in pixels, at which two names read as
	 * belonging to different lines. Must match the declutter pass's `omitWithin`:
	 * a name allowed to hold the midpoint on this measure has to survive the
	 * crowd sweep too, or it is deleted rather than moved.
	 *
	 * Zero — the default — leaves every name at the midpoint, so charts an editor
	 * positions by hand keep the layout they were tuned against.
	 */
	crowdRadius?: number;
}): OnLineSeriesDeclutterInput[] {
	const midpointPx = innerWidth / 2;
	const customLabels = legend.customLabels ?? {};
	const inputs: OnLineSeriesDeclutterInput[] = [];

	const series = categories
		.map((category, categoryIndex) => {
			const filteredData = flattenedData.filter(
				(d: FlatData) =>
					d[category] !== '' &&
					d[category] !== undefined &&
					d[category] !== null
			);
			if (filteredData.length === 0) {
				return null;
			}

			const points: SeriesPixelPoint[] = filteredData.map((d) => {
				const dependentValue = getSeriesDependentValue
					? getSeriesDependentValue(d, category, categoryIndex)
					: d[category];
				return {
					px: independentScale(getIndependentValue(d)),
					py: dependentScale(dependentValue),
				};
			});

			const customEntry = customLabels[category];
			const text = customEntry?.text ?? category;
			const fontSize = customEntry?.fontSize ?? legend.fontSize;
			const fontWeight = customEntry?.fontWeight ?? legend.fontWeight;

			return {
				category,
				categoryIndex,
				points,
				customEntry,
				text,
				fontSize,
				fontWeight,
				halfWidth:
					measureTextWidth(
						text,
						fontSize,
						customEntry?.fontFamily,
						fontWeight
					) / 2,
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	const placed: PlacedAnchor[] = [];

	for (const entry of series) {
		const locked = hasAuthorDirectLabelOverride(entry.customEntry);
		// Author offsets are stored relative to the anchor, so moving it would
		// drag hand-placed labels off their chosen spot.
		const anchorX =
			locked || crowdRadius <= 0
				? midpointPx
				: pickSeriesAnchorX({
						points: entry.points,
						otherSeries: series
							.filter((other) => other !== entry)
							.map((other) => other.points),
						placed,
						innerWidth,
						halfWidth: entry.halfWidth,
						minClearance: crowdRadius,
					});
		const anchorY = getSeriesYAtPixelX(entry.points, anchorX);

		if (!locked) {
			placed.push({
				x: anchorX,
				y: anchorY,
				halfWidth: entry.halfWidth,
				minClearance: crowdRadius,
			});
		}

		const authorOffset = getDirectLabelOffsetFromCustom(
			entry.customEntry,
			anchorX,
			anchorY,
			padding,
			scales
		);

		inputs.push({
			category: entry.category,
			id: buildOnLineSeriesLabelId(entry.category, entry.categoryIndex),
			x: anchorX,
			y: anchorY,
			text: entry.text,
			fontSize: entry.fontSize,
			fontFamily: entry.customEntry?.fontFamily,
			fontWeight: entry.fontWeight,
			maxWidth: entry.customEntry?.maxWidth ?? 0,
			textAnchor: 'middle',
			dominantBaseline: 'middle',
			defaultDx: authorOffset.dx,
			defaultDy: authorOffset.dy,
			locked,
			omittable: true,
		});
	}

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
