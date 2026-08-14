import { hasExplicitAxisDomain } from './isAutoAxisDomain';

type LinearDomainPair = [number, number];

function toFinitePair(domain: unknown): LinearDomainPair | null {
	if (!Array.isArray(domain) || domain.length < 2) {
		return null;
	}
	const min = Number(domain[0]);
	const max = Number(domain[1]);
	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return null;
	}
	return [min, max];
}

/**
 * Explicit `[min, max]` wins; otherwise use the data extent.
 *
 * @param configDomain
 * @param dataExtent
 */
export function resolveLinearScaleDomain(
	configDomain: unknown,
	dataExtent: LinearDomainPair
): LinearDomainPair {
	if (hasExplicitAxisDomain(configDomain)) {
		const explicit = toFinitePair(configDomain);
		if (explicit) {
			return explicit;
		}
	}
	return dataExtent;
}
