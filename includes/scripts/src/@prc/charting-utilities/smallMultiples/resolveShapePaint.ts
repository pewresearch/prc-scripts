export type ShapePaintDefaults = {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
};

export type ShapePaint = {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	opacity?: number;
};

/**
 * Resolve mark fill/stroke/opacity from shapes.customStyles + series defaults.
 * Matches Line / Bar / Pie paint resolution.
 */
export function resolveShapePaint(custom: ShapePaint | null | undefined, defaults: ShapePaintDefaults): ShapePaint {
	const seriesOpacity = defaults.opacity ?? 1;
	return {
		fill: custom?.fill || defaults.fill,
		stroke: custom?.stroke || defaults.stroke,
		strokeWidth: custom?.strokeWidth ?? defaults.strokeWidth,
		opacity: (custom?.opacity ?? 1) * seriesOpacity,
	};
}
