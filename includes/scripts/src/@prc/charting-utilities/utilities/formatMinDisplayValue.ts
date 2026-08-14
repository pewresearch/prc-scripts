import { abbreviateNumber } from './helpers';

export type MinDisplayValueConfig = {
	/** Values below this read as `<floor`. Null disables the behaviour. */
	minDisplayValue?: number | null;
	toFixedDecimal: number;
	truncateDecimal?: boolean;
	abbreviateValue?: boolean;
	toLocaleString?: boolean;
};

/**
 * Render a number through the decimal, abbreviation and locale pipeline that
 * label and tooltip values already share, so a floor reads exactly as a real
 * value at that magnitude would.
 *
 * @param datum  The number to render.
 * @param config The surface's number formatting options.
 * @return The rendered number, without any unit.
 */
export function selectFormattedNumber(
	datum: number,
	config: MinDisplayValueConfig
): string {
	if (config.abbreviateValue) {
		return abbreviateNumber(datum, config.toFixedDecimal);
	}
	if (config.toLocaleString) {
		return false === config.truncateDecimal
			? datum.toLocaleString('en-US', {
					minimumFractionDigits: config.toFixedDecimal,
					maximumFractionDigits: config.toFixedDecimal,
				})
			: Number(datum.toFixed(config.toFixedDecimal)).toLocaleString(
					'en-US'
				);
	}
	return false === config.truncateDecimal
		? Number(datum).toFixed(config.toFixedDecimal)
		: String(Number(Number(datum).toFixed(config.toFixedDecimal)));
}

/**
 * The `<floor` string for a value too small to print honestly, or null when
 * the value should format normally.
 *
 * @param value  The data point's value.
 * @param config The surface's number formatting options.
 * @return The `<floor` string, or null to format normally.
 */
/**
 * How many decimal places it takes to write a number out in full.
 *
 * @param value A finite number.
 * @return The count of significant decimal places.
 */
function decimalsFor(value: number): number {
	const written = String(value);
	const point = written.indexOf('.');
	return -1 === point ? 0 : written.length - point - 1;
}

export function formatMinDisplayValue(
	value: number,
	config: MinDisplayValueConfig
): string | null {
	const floor = config.minDisplayValue;
	if (null === floor || undefined === floor || !Number.isFinite(floor)) {
		return null;
	}
	if (!Number.isFinite(value) || value < 0 || value >= floor) {
		return null;
	}
	// The floor is the number the editor typed, so it has to survive rounding:
	// a floor of 0.1 on a chart formatting to whole numbers still reads `<0.1`,
	// never `<0`. Abbreviation and locale separators still apply, so a floor of
	// 10000 on an abbreviated chart reads `<10K`.
	return `<${selectFormattedNumber(floor, {
		...config,
		toFixedDecimal: Math.max(
			config.toFixedDecimal ?? 0,
			decimalsFor(floor)
		),
	})}`;
}
