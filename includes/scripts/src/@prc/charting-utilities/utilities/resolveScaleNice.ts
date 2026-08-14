/**
 * Decide whether Visx/d3 scale.nice() should run for a linear domain.
 *
 * Explicit `nice` always wins. Otherwise: off when the domain comes from
 * config (editor/preset), on when the domain is derived from data.
 */
export function resolveScaleNice(
	nice: boolean | undefined,
	hasExplicitDomain: boolean
): boolean {
	if (typeof nice === 'boolean') {
		return nice;
	}
	return !hasExplicitDomain;
}
