import { abbreviateNumber } from './helpers';

export type MinDisplayValueConfig = {
	/** Values below this read as `<floor`. Null disables the behaviour. */
	minDisplayValue?: number | null;
	toFixedDecimal: number;
	/**
	 * Charts saved before Decimal Places became authoritative. `true` keeps the
	 * old "up to N places, drop trailing zeros" rendering so published charts do
	 * not change. The editor clears it as soon as Decimal Places is edited.
	 */
	truncateDecimal?: boolean;
	abbreviateValue?: boolean;
	toLocaleString?: boolean;
};

/**
 * Render a number through the decimal, abbreviation and locale pipeline that
 * label, tooltip and net value surfaces share.
 *
 * Decimal Places is authoritative: a value of 20 at 3 places reads `20.000`.
 * Zero places leaves the number's own precision alone.
 *
 * @param datum  The number to render.
 * @param config The surface's number formatting options.
 * @return The rendered number, without any unit.
 */
export function selectFormattedNumber(
	datum: number,
	config: MinDisplayValueConfig
): string {
	const places = config.toFixedDecimal;

	if (config.abbreviateValue) {
		return abbreviateNumber(datum, places);
	}

	if (true === config.truncateDecimal) {
		const trimmed = Number(Number(datum).toFixed(places));
		return config.toLocaleString
			? trimmed.toLocaleString('en-US')
			: String(trimmed);
	}

	if (!(places > 0)) {
		return config.toLocaleString
			? Number(datum).toLocaleString('en-US')
			: String(Number(datum));
	}

	return config.toLocaleString
		? Number(datum).toLocaleString('en-US', {
				minimumFractionDigits: places,
				maximumFractionDigits: places,
			})
		: Number(datum).toFixed(places);
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
