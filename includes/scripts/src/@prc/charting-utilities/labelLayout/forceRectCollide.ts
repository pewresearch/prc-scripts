/* eslint-disable jsdoc/require-param */
import type { SimRectNode } from '../types/labels';

export interface ForceRectCollideOptions {
	padding?: number;
	strength?: number;
	iterations?: number;
}

/**
 * Custom d3-force collision force for axis-aligned rectangular labels.
 * Built-in forceCollide is circular-only; text labels need width/height boxes.
 */
export function forceRectCollide<Node extends SimRectNode>(options: ForceRectCollideOptions = {}) {
	const padding = options.padding ?? 2;
	const strength = options.strength ?? 1;
	const iterations = options.iterations ?? 1;

	let nodes: Node[] = [];

	function force(alpha: number) {
		const count = nodes.length;
		for (let k = 0; k < iterations; k++) {
			for (let i = 0; i < count; i++) {
				const node = nodes[i];
				const nx1 = node.x + node.bboxOffsetX - padding;
				const ny1 = node.y + node.bboxOffsetY - padding;
				const nx2 = nx1 + node.width + padding * 2;
				const ny2 = ny1 + node.height + padding * 2;

				for (let j = i + 1; j < count; j++) {
					const other = nodes[j];
					const ox1 = other.x + other.bboxOffsetX - padding;
					const oy1 = other.y + other.bboxOffsetY - padding;
					const ox2 = ox1 + other.width + padding * 2;
					const oy2 = oy1 + other.height + padding * 2;

					const overlapX = Math.min(nx2, ox2) - Math.max(nx1, ox1);
					const overlapY = Math.min(ny2, oy2) - Math.max(ny1, oy1);

					if (overlapX <= 0 || overlapY <= 0) {
						continue;
					}

					// Prefer to resolve on the axis with smaller overlap.
					// But if that axis is position-locked on both nodes (fy/fx set),
					// fall back to the other axis so lockY dot-plot labels still
					// separate horizontally when two dots share the same x value.
					const preferX = overlapX < overlapY;
					const xFree =
						node.fx === null || node.fx === undefined || other.fx === null || other.fx === undefined;
					const yFree =
						node.fy === null || node.fy === undefined || other.fy === null || other.fy === undefined;
					const useX = preferX ? xFree || !yFree : !yFree && xFree;

					if (useX) {
						const amount = (overlapX / 2) * strength * alpha;
						const sign = node.x <= other.x ? -1 : 1;
						if (node.fx === null || node.fx === undefined) {
							node.vx += sign * amount;
						}
						if (other.fx === null || other.fx === undefined) {
							other.vx -= sign * amount;
						}
					} else {
						const amount = (overlapY / 2) * strength * alpha;
						const sign = node.y <= other.y ? -1 : 1;
						if (node.fy === null || node.fy === undefined) {
							node.vy += sign * amount;
						}
						if (other.fy === null || other.fy === undefined) {
							other.vy -= sign * amount;
						}
					}
				}
			}
		}
	}

	force.initialize = (initializedNodes: Node[]) => {
		nodes = initializedNodes;
	};

	return force;
}
