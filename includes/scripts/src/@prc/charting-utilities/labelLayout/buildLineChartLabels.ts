import type { FlatData } from '../types/flatData';
import type { Labels } from '../types/labels';
import {
	getCustomLabel,
	getCustomLabelText,
	isLabelVisible,
} from '../utilities/helpers';
import { getLabelFormat } from '../compute/labels';

import {
	buildChartLabelId,
	getLabelMaxWidth,
	hasAuthorLabelOverride,
} from './helpers';
import type { DeclutterLabelInput } from '../types/labels';

export function getLineLabelContent(
	d: FlatData,
	category: string,
	j: number,
	filteredDataLength: number,
	labels: Labels
): { content: string; defaultLabel: string } {
	const customLabelText = getCustomLabelText(d, category);
	const customLabel = getCustomLabel(d, category);
	const defaultLabel = getLabelFormat(d[category], category, labels, null);

	let content = '';
	if (customLabelText) {
		content = customLabelText;
	} else if (customLabel) {
		content = customLabel;
	} else if (
		labels.showFirstLastPointsOnly &&
		(j === 0 || j === filteredDataLength - 1)
	) {
		content = defaultLabel;
	} else if (!labels.showFirstLastPointsOnly) {
		content = defaultLabel;
	}

	return { content, defaultLabel };
}

export function buildLineChartLabelInputs({
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
			(d: FlatData) => d[category] || d[category] !== ''
		);

		filteredData.forEach((d, pointIndex) => {
			if (!isLabelVisible(d, category)) {
				return;
			}

			const { content } = getLineLabelContent(
				d,
				category,
				pointIndex,
				filteredData.length,
				labels
			);
			if (!content) {
				return;
			}

			const id = buildChartLabelId([
				'line',
				categoryIndex,
				category,
				d.x,
				pointIndex,
			]);
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

export function buildLineChartLabelId(
	categoryIndex: number,
	category: string,
	d: FlatData,
	pointIndex: number
): string {
	return buildChartLabelId([
		'line',
		categoryIndex,
		category,
		d.x,
		pointIndex,
	]);
}
