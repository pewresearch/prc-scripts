import type { CategoryStyle } from '../types/colors';
import type { Nodes } from '../types/nodes';

/**
 * Resolve a marker's fixed radius from chart defaults, series style, and the
 * mark popover.
 *
 * Radius is geometry rather than paint, so it resolves on its own instead of
 * riding along in the `ShapePaint` object. On charts that scale radius from a
 * data column, pass the result as the `pointSize` argument of
 * `resolvePointRadius` so the series value acts as the unscaled fallback.
 *
 * @param nodes  Chart-wide node defaults.
 * @param series Per-series style.
 * @param custom Per-mark style.
 */
export function resolvePointSize(
	nodes: Pick<Nodes, 'pointSize'>,
	series?: CategoryStyle | null,
	custom?: CategoryStyle | null
): number {
	return custom?.pointSize ?? series?.pointSize ?? nodes.pointSize;
}
