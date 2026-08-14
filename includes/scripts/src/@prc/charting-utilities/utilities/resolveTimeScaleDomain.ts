type TimeDomainInput = Date | number | string | null | undefined;
type TimeDomainPair = [Date, Date];

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse an ISO `YYYY-MM-DD` string as a LOCAL date. `new Date('2000-01-01')`
 * parses as UTC midnight, which renders as Dec 31 1999 in negative UTC
 * offsets — a whole-year drift for year-granularity axes.
 *
 * @param value
 */
function parseIsoDateLocal(value: string): Date | null {
	const match = ISO_DATE_PATTERN.exec(value);
	if (!match) {
		return null;
	}
	const date = new Date(
		Number(match[1]),
		Number(match[2]) - 1,
		Number(match[3])
	);
	return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Convert an author-set config domain entry to a Date.
 *
 * Bare numbers (and numeric strings) are rejected: renderers before 2026
 * ignored every stored time domain, so numeric pairs persisted by legacy
 * charts ([0, 100] defaults, [2000, 2020] template years) are data, not
 * intent. The editor persists explicit time domains as ISO date strings.
 *
 * @param value
 */
function toExplicitConfigDate(value: TimeDomainInput): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		if (Number.isFinite(Number(value))) {
			return null;
		}
		const isoDate = parseIsoDateLocal(value.trim());
		if (isoDate) {
			return isoDate;
		}
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	return null;
}

/**
 * Convert a data-extent entry to a Date. Data values are trusted, so numeric
 * years/timestamps are accepted here (unlike config domains).
 *
 * @param value
 */
function toValidDate(value: TimeDomainInput): Date | null {
	if (typeof value === 'number' && Number.isFinite(value)) {
		// Year-granularity data passes calendar years (e.g. 2000).
		const date =
			Math.abs(value) < 10000 ? new Date(value, 0, 1) : new Date(value);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const asNumber = Number(value);
		if (Number.isFinite(asNumber) && Math.abs(asNumber) < 10000) {
			const date = new Date(asNumber, 0, 1);
			return Number.isNaN(date.getTime()) ? null : date;
		}
	}

	return toExplicitConfigDate(value);
}

function isValidDataExtent(dataExtent: unknown): dataExtent is TimeDomainPair {
	if (!Array.isArray(dataExtent) || dataExtent.length < 2) {
		return false;
	}
	const start = toValidDate(dataExtent[0] as TimeDomainInput);
	const end = toValidDate(dataExtent[1] as TimeDomainInput);
	return start !== null && end !== null;
}

/**
 * Explicit time domain (Dates or date strings) wins; bare numeric pairs are
 * legacy data and mean auto; otherwise use the data extent.
 *
 * @param configDomain
 * @param dataExtent
 */
export function resolveTimeScaleDomain(
	configDomain: unknown,
	dataExtent: unknown
): TimeDomainPair | undefined {
	if (Array.isArray(configDomain) && configDomain.length >= 2) {
		const start = toExplicitConfigDate(configDomain[0] as TimeDomainInput);
		const end = toExplicitConfigDate(configDomain[1] as TimeDomainInput);
		if (start && end) {
			return [start, end];
		}
	}

	if (isValidDataExtent(dataExtent)) {
		return [
			toValidDate(dataExtent[0] as TimeDomainInput) as Date,
			toValidDate(dataExtent[1] as TimeDomainInput) as Date,
		];
	}

	return undefined;
}
