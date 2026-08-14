import type { Nodes } from '../types/nodes';

// Resolve node fill/stroke from `nodes` config and a series/category color.
function resolveShapeColor(value: string, seriesColor: string): string {
	if (value === 'inherit') {
		return seriesColor;
	}
	if (value === 'white') {
		return '#ffffff';
	}
	return value;
}

export function resolveNodeShapeColors(
	nodes: Nodes,
	seriesColor: string
): { fill: string; stroke: string } {
	return {
		fill: resolveShapeColor(nodes.pointFill, seriesColor),
		stroke: resolveShapeColor(nodes.pointStroke, seriesColor),
	};
}
