import { scaleLinear, scaleOrdinal, scaleThreshold } from '@visx/scale';

export type ValueColorScaleMode = 'linear' | 'threshold' | 'ordinal';

export type CreateValueColorScaleArgs = {
	mode?: ValueColorScaleMode | string | null;
	domain?: Array<string | number> | null;
	colors: string[];
	emptyFill?: string;
};

export type ValueColorScale = {
	mode: ValueColorScaleMode;
	/** Resolve a fill for a numeric/string value; null/undefined → emptyFill. */
	getFill: (value: string | number | null | undefined) => string;
	/** Scale instance useful for LegendLinear / LegendThreshold / LegendOrdinal. */
	scale: any;
	domain: Array<string | number>;
	range: string[];
};

/** Strip `light-dark(light, dark)` wrappers so d3/visx scales get a concrete hex. */
export function resolveSolidColor(color: string): string {
	if (!color) {
		return '#cccccc';
	}
	const match = color.match(/^light-dark\(([^,]+),/);
	return match ? match[1].trim() : color;
}

/**
 * Shared value→color scale used by maps and heat-map tables.
 * Mirrors BlockUSA / AlbersUSA scale construction.
 */
export function createValueColorScale({
	mode = 'linear',
	domain = [],
	colors,
	emptyFill = '#F5F5F5',
}: CreateValueColorScaleArgs): ValueColorScale {
	const resolvedMode: ValueColorScaleMode =
		mode === 'threshold' || mode === 'ordinal' || mode === 'linear'
			? mode
			: 'linear';
	const range = (colors?.length ? colors : ['#cce5f0', '#002d47']).map(
		resolveSolidColor
	);
	const safeDomain = domain ?? [];

	if (resolvedMode === 'ordinal') {
		const ordinalDomain = safeDomain.map(String);
		const scale = scaleOrdinal<string, string>({
			domain: ordinalDomain,
			range,
		});
		return {
			mode: resolvedMode,
			scale,
			domain: ordinalDomain,
			range,
			getFill: (value) => {
				if (value === null || value === undefined || value === '') {
					return emptyFill;
				}
				return scale(String(value)) || emptyFill;
			},
		};
	}

	const numericDomain = safeDomain
		.map((d) => (typeof d === 'number' ? d : parseFloat(String(d))))
		.filter((d) => Number.isFinite(d));

	if (resolvedMode === 'threshold') {
		const scale = scaleThreshold<number, string>({
			domain: numericDomain,
			range,
		});
		return {
			mode: resolvedMode,
			scale,
			domain: numericDomain,
			range,
			getFill: (value) => {
				if (value === null || value === undefined || value === '') {
					return emptyFill;
				}
				const n =
					typeof value === 'number'
						? value
						: parseFloat(String(value));
				if (!Number.isFinite(n)) {
					return emptyFill;
				}
				return scale(n) || emptyFill;
			},
		};
	}

	const linearDomain =
		numericDomain.length >= 2
			? [numericDomain[0], numericDomain[numericDomain.length - 1]]
			: numericDomain.length === 1
				? [0, numericDomain[0]]
				: [0, 100];
	const scale = scaleLinear<string>({
		domain: linearDomain,
		range,
	});

	return {
		mode: 'linear',
		scale,
		domain: linearDomain,
		range,
		getFill: (value) => {
			if (value === null || value === undefined || value === '') {
				return emptyFill;
			}
			const n =
				typeof value === 'number' ? value : parseFloat(String(value));
			if (!Number.isFinite(n)) {
				return emptyFill;
			}
			return scale(n) || emptyFill;
		},
	};
}
