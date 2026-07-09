/* eslint-disable jsdoc/require-param */
import type { FlatData } from '../types/flatData';
import type { Labels } from '../types/labels';
import { scalePoint } from '@visx/scale';

import {
	buildChartLabelId,
	getLabelMaxWidth,
	hasAuthorLabelOverride,
} from './helpers';
import type { DeclutterLabelInput } from '../types/labels';

// Inline helpers that avoid pulling in charting-utilities runtime (d3-time-format breaks Jest).
function getCustomLabelText(d: FlatData, category: string): string {
	return d.__labels?.[category] ?? '';
}

function getCustomLabel(d: FlatData, category: string): string {
	return d.__customLabels?.[category] ?? '';
}

function getLabelFormat(
	value: any,
	_category: string,
	_labels: Labels,
	_extra: null
): string {
	return value !== null && value !== undefined ? String(value) : '';
}

function isLabelVisible(d: FlatData, category: string): boolean {
	return d.__hidden?.[category] !== true;
}

// ---------------------------------------------------------------------------
// Scatter
// ---------------------------------------------------------------------------

export function buildScatterLabelId(
	categoryIndex: number,
	category: string,
	d: FlatData,
	pointIndex: number
): string {
	return buildChartLabelId([
		'scatter',
		categoryIndex,
		category,
		d.x,
		pointIndex,
	]);
}

export function buildScatterLabelInputs({
	categories,
	flattenedData,
	labels,
	labelProps,
	independentScale,
	dependentScale,
	getIndependentValue,
}: {
	categories: string[];
	flattenedData: FlatData[];
	labels: Labels;
	labelProps: Record<string, unknown>;
	independentScale: (value: any) => number;
	dependentScale: (value: any) => number;
	getIndependentValue: (d: FlatData) => any;
}): DeclutterLabelInput[] {
	const inputs: DeclutterLabelInput[] = [];

	categories.forEach((category, categoryIndex) => {
		const filteredData = flattenedData.filter(
			(d: FlatData) => d[category] !== '' && d[category] != null
		);

		filteredData.forEach((d, pointIndex) => {
			if (!isLabelVisible(d, category)) {
				return;
			}

			const customLabelText = getCustomLabelText(d, category);
			const customLabel = customLabelText || getCustomLabel(d, category);
			const defaultLabel = getLabelFormat(
				d[category],
				category,
				labels,
				null
			);

			let content = '';
			if (customLabel) {
				content = customLabel;
			} else if (
				labels.showFirstLastPointsOnly &&
				(pointIndex === 0 || pointIndex === filteredData.length - 1)
			) {
				content = defaultLabel;
			} else if (!labels.showFirstLastPointsOnly) {
				content = defaultLabel;
			}

			if (!content) {
				return;
			}

			const id = buildScatterLabelId(
				categoryIndex,
				category,
				d,
				pointIndex
			);
			inputs.push({
				id,
				x: independentScale(getIndependentValue(d)),
				y: dependentScale(d[category]),
				text: content,
				fontSize: labels.fontSize,
				fontFamily: labels.fontFamily,
				fontWeight: labels.fontWeight,
				maxWidth: getLabelMaxWidth(d, category),
				textAnchor:
					(labelProps.textAnchor as DeclutterLabelInput['textAnchor']) ??
					labels.textAnchor,
				dominantBaseline:
					(labelProps.dominantBaseline as DeclutterLabelInput['dominantBaseline']) ??
					'middle',
				defaultDx: labels.labelPositionDX,
				defaultDy: labels.labelPositionDY,
				locked: hasAuthorLabelOverride(d, category),
			});
		});
	});

	return inputs;
}

// ---------------------------------------------------------------------------
// DotPlot
// DotPlot axes are transposed: value (dependent) maps to x, row key
// (independent) maps to y via a per-group scalePoint (groupScale).
// ---------------------------------------------------------------------------

export interface DotPlotGroupPosition {
	data: FlatData[];
	startY: number;
	height: number;
}

export function buildDotPlotLabelId(
	groupIndex: number,
	categoryIndex: number,
	category: string,
	d: FlatData,
	pointIndex: number
): string {
	return buildChartLabelId([
		'dot-plot',
		groupIndex,
		categoryIndex,
		category,
		d.x,
		pointIndex,
	]);
}

export function buildAllDotPlotLabelInputs({
	groupPositioning,
	categories,
	labels,
	labelProps,
	dependentScale,
	getIndependentValue,
}: {
	groupPositioning: DotPlotGroupPosition[];
	categories: string[];
	labels: Labels;
	labelProps: Record<string, unknown>;
	dependentScale: (value: any) => number;
	getIndependentValue: (d: FlatData) => any;
}): DeclutterLabelInput[] {
	const inputs: DeclutterLabelInput[] = [];

	groupPositioning.forEach((groupPos, groupIndex) => {
		const {
			data: groupRowData,
			startY,
			height: groupBandHeight,
		} = groupPos;

		// Must match DotPlot.tsx / voronoi: scalePoint with padding 0.5.
		const groupScale = scalePoint<string>({
			domain: groupRowData.map(getIndependentValue),
			range: [startY, startY + groupBandHeight],
			padding: 0.5,
		});

		categories.forEach((category, categoryIndex) => {
			const filteredData = groupRowData.filter(
				(d: FlatData) => d[category] !== '' && d[category] != null
			);

			filteredData.forEach((d, pointIndex) => {
				if (!isLabelVisible(d, category)) {
					return;
				}

				const val = d[category];
				if (val === null || val === undefined || val === '') {
					return;
				}

				const customLabelText = getCustomLabelText(d, category);
				const customLabel =
					customLabelText || getCustomLabel(d, category);
				const defaultLabel = getLabelFormat(
					val,
					category,
					labels,
					null
				);
				const content = customLabel || defaultLabel;

				if (!content) {
					return;
				}

				// DotPlot: x = dependentScale(value), y = groupScale(rowKey)
				const cx = dependentScale(val as number);
				const cy = groupScale(getIndependentValue(d)) ?? 0;

				const id = buildDotPlotLabelId(
					groupIndex,
					categoryIndex,
					category,
					d,
					pointIndex
				);
				inputs.push({
					id,
					x: cx,
					y: cy,
					text: content,
					fontSize: labels.fontSize,
					fontFamily: labels.fontFamily,
					fontWeight: labels.fontWeight,
					maxWidth: getLabelMaxWidth(d, category),
					textAnchor:
						(labelProps.textAnchor as DeclutterLabelInput['textAnchor']) ??
						labels.textAnchor,
					dominantBaseline:
						(labelProps.dominantBaseline as DeclutterLabelInput['dominantBaseline']) ??
						'middle',
					// defaultDx/Dy must be 0 here. labelPositionDX/DY are applied as
					// SVG text attributes via labelProps spread on the label element,
					// so including them in the sim anchor would double-count them.
					// The sim anchor is the geometric dot center (cx, cy); only
					// collision displacement is returned as dx/dy.
					defaultDx: 0,
					defaultDy: 0,
					locked: hasAuthorLabelOverride(d, category),
				});
			});
		});
	});

	return inputs;
}
