import { abbreviateNumber, decodeHtmlEntities } from '../utilities/helpers';
import { formatMinDisplayValue } from '../utilities/formatMinDisplayValue';

type LabelFormatConfig = {
	absoluteValue: boolean;
	customLabelFormat?:
		| ((value: number | Date | string, category: string) => string)
		| null;
	truncateDecimal: boolean;
	toFixedDecimal: number;
	toLocaleString: boolean;
	abbreviateValue: boolean;
	labelUnit: string;
	labelUnitPosition: 'start' | 'end';
	minDisplayValue?: number | null;
};

type BarProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	value: number;
	/** When set, labels anchor to the bar edge at `start` (x/y) vs `start+size`. */
	valueAtStart?: boolean;
};

type PositionProps = {
	labelPositionDX: number;
	labelPositionDY: number;
	labelPositionBar: 'inside' | 'outside' | 'center';
};

const getLabelProps = (config: {
	labelAngle?: number;
	fontSize: number;
	fontWeight: number;
	fontFamily: string;
	textAnchor: 'start' | 'middle' | 'end';
	labelPositionDY: number;
	labelPositionDX: number;
}) => {
	return {
		pointerEvents: 'none',
		angle: config.labelAngle,
		textAnchor: config.textAnchor,
		dy: config.labelPositionDY,
		dx: config.labelPositionDX,
		style: {
			fontSize: config.fontSize,
			fontWeight: config.fontWeight,
			fontFamily: config.fontFamily,
		},
	};
};

const getLabelFormat = (
	d: any,
	category: string,
	config: LabelFormatConfig,
	cutoff: number | null
) => {
	const datum = config.absoluteValue ? Math.abs(d) : Number(d);

	//if custom label is set, use it and return
	if (config.customLabelFormat) {
		return decodeHtmlEntities(config.customLabelFormat(datum, category));
	}

	// running Number() twice will truncate trailing zeros
	const fixedDatum = config.truncateDecimal
		? Number(Number(datum).toFixed(config.toFixedDecimal))
		: Number(datum).toFixed(config.toFixedDecimal);

	const localizedDatum = config.truncateDecimal
		? Number(datum.toFixed(config.toFixedDecimal)).toLocaleString('en-US')
		: // if we are not truncating decimals, we can just use the toLocaleString method
			datum.toLocaleString('en-US', {
				minimumFractionDigits: config.toFixedDecimal,
				maximumFractionDigits: config.toFixedDecimal,
			});
	const abbreviatedDatum = abbreviateNumber(datum, config.toFixedDecimal);

	// if custom label is not set, check for cutoff
	if (cutoff === null || Number(fixedDatum) > cutoff) {
		const floored = formatMinDisplayValue(datum, config);
		let numeric: string;
		if (null !== floored) {
			numeric = floored;
		} else if (config.abbreviateValue) {
			numeric = `${abbreviatedDatum}`;
		} else if (config.toLocaleString) {
			numeric = `${localizedDatum}`;
		} else {
			numeric = `${fixedDatum}`;
		}

		if (config.labelUnit) {
			return decodeHtmlEntities(
				'end' === config.labelUnitPosition
					? `${numeric}${config.labelUnit}`
					: `${config.labelUnit}${numeric}`
			);
		}
		return decodeHtmlEntities(numeric);
	}
	return '';
};

const positionNodeLabel = () => {};

const valueTipAtStart = (
	bar: BarProps,
	orientation: 'vertical' | 'horizontal'
): boolean => {
	if (bar.valueAtStart !== undefined) {
		return bar.valueAtStart;
	}
	// Stacked/diverging visx rects: vertical positives and horizontal negatives
	// report the value on the rect start edge.
	return orientation === 'vertical' ? bar.value >= 0 : bar.value < 0;
};

const horizontalPositioning = (
	bar: BarProps,
	config: PositionProps,
	labelCutOff: number,
	stack: 'stacked' | 'single'
) => {
	const { x, y, width, height, value } = bar;
	const { labelPositionDX, labelPositionDY, labelPositionBar } = config;
	const tipAtStart = valueTipAtStart(bar, 'horizontal');
	const tipX = tipAtStart ? x : x + width;
	const outsideX = tipAtStart
		? tipX - 5 + labelPositionDX
		: tipX + 5 + labelPositionDX;
	if (value < labelCutOff && stack === 'single') {
		return {
			x: outsideX,
			y: y + height / 2 + labelPositionDY,
		};
	}
	if (labelPositionBar === 'center') {
		return {
			x: x + width / 2 + labelPositionDX,
			y: y + height / 2 + labelPositionDY,
		};
	}
	if (labelPositionBar === 'inside') {
		return {
			x: tipAtStart
				? x + 20 + labelPositionDX
				: x + width - 20 + labelPositionDX,
			y: y + height / 2 + labelPositionDY,
		};
	}
	return {
		x: outsideX,
		y: y + height / 2 + labelPositionDY,
	};
};
const verticalPositioning = (
	bar: BarProps,
	config: PositionProps,
	labelCutOff: number,
	stack: 'stacked' | 'single'
) => {
	const { x, y, width, height, value } = bar;
	const { labelPositionDX, labelPositionDY, labelPositionBar } = config;
	const tipAtStart = valueTipAtStart(bar, 'vertical');
	const tipY = tipAtStart ? y : y + height;
	const outsideY = tipAtStart
		? tipY - 5 + labelPositionDY
		: tipY + 5 + labelPositionDY;
	if (Math.abs(value) < labelCutOff) {
		return {
			x: x + width / 2 + labelPositionDX,
			y: outsideY,
		};
	}
	if (labelPositionBar === 'center') {
		return {
			x: x + width / 2 + labelPositionDX,
			y: y + height / 2 + labelPositionDY,
		};
	}
	if (labelPositionBar === 'inside') {
		return {
			x: x + width / 2 + labelPositionDX,
			y: tipAtStart
				? y + 20 + labelPositionDY
				: y + height - 20 + labelPositionDY,
		};
	}
	return {
		x: x + width / 2 + labelPositionDX,
		y: outsideY,
	};
};

const positionBarLabel = (
	bar: BarProps,
	config: PositionProps,
	labelCutOff: number,
	orientation: 'vertical' | 'horizontal',
	stack: 'stacked' | 'single'
) => {
	if (orientation === 'horizontal') {
		return horizontalPositioning(bar, config, labelCutOff, stack);
	}
	return verticalPositioning(bar, config, labelCutOff, stack);
};

export { getLabelProps, getLabelFormat, positionNodeLabel, positionBarLabel };
