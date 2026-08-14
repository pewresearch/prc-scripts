/**
 * Whether an axis domain should be inferred from data.
 *
 * Auto = missing / incomplete. Any finite `[min, max]` (including `[0, 100]`)
 * is an explicit author domain.
 *
 * @param domain
 */
export function isAutoAxisDomain(domain: unknown): boolean {
	if (domain === null || domain === undefined) {
		return true;
	}
	if (!Array.isArray(domain) || domain.length < 2) {
		return true;
	}
	const [min, max] = domain;
	if (min instanceof Date && max instanceof Date) {
		return Number.isNaN(min.getTime()) || Number.isNaN(max.getTime());
	}
	const minNum =
		min === null || min === undefined || min === '' ? NaN : Number(min);
	const maxNum =
		max === null || max === undefined || max === '' ? NaN : Number(max);
	return !Number.isFinite(minNum) || !Number.isFinite(maxNum);
}

/**
 * @param domain
 */
export function hasExplicitAxisDomain(domain: unknown): boolean {
	return !isAutoAxisDomain(domain);
}
