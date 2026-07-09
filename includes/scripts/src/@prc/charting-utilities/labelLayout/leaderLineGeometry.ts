/* eslint-disable jsdoc/require-param */
import type { LabelBBox } from './measureLabel';

export interface LeaderLineEndpoints {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	distance: number;
}

export interface ComputeLeaderLineEndpointsOptions {
	anchorX: number;
	anchorY: number;
	labelCenterX: number;
	labelCenterY: number;
	bbox: LabelBBox;
	anchorRadius?: number;
	edgeBuffer?: number;
}

/**
 * Ray–rectangle intersection: exit point on the label bbox perimeter toward the anchor.
 */
export function rectEdgeTowardPoint(
	centerX: number,
	centerY: number,
	bbox: LabelBBox,
	targetX: number,
	targetY: number
): { x: number; y: number } {
	const left = centerX + bbox.offsetX;
	const right = left + bbox.width;
	const top = centerY + bbox.offsetY;
	const bottom = top + bbox.height;

	const dx = targetX - centerX;
	const dy = targetY - centerY;

	if (dx === 0 && dy === 0) {
		return { x: centerX, y: centerY };
	}

	let bestT = Infinity;
	let bestX = centerX;
	let bestY = centerY;

	const tryEdge = (t: number, x: number, y: number, onEdge: boolean) => {
		if (t > 0 && t < bestT && onEdge) {
			bestT = t;
			bestX = x;
			bestY = y;
		}
	};

	if (dx !== 0) {
		const tLeft = (left - centerX) / dx;
		tryEdge(tLeft, left, centerY + tLeft * dy, centerY + tLeft * dy >= top && centerY + tLeft * dy <= bottom);

		const tRight = (right - centerX) / dx;
		tryEdge(tRight, right, centerY + tRight * dy, centerY + tRight * dy >= top && centerY + tRight * dy <= bottom);
	}

	if (dy !== 0) {
		const tTop = (top - centerY) / dy;
		tryEdge(tTop, centerX + tTop * dx, top, centerX + tTop * dx >= left && centerX + tTop * dx <= right);

		const tBottom = (bottom - centerY) / dy;
		tryEdge(
			tBottom,
			centerX + tBottom * dx,
			bottom,
			centerX + tBottom * dx >= left && centerX + tBottom * dx <= right
		);
	}

	return { x: bestX, y: bestY };
}

/**
 * Compute leader-line endpoints: anchor-side stops at node radius; label-side starts at bbox edge.
 */
export function computeLeaderLineEndpoints({
	anchorX,
	anchorY,
	labelCenterX,
	labelCenterY,
	bbox,
	anchorRadius = 0,
	edgeBuffer = 3,
}: ComputeLeaderLineEndpointsOptions): LeaderLineEndpoints {
	const dx = labelCenterX - anchorX;
	const dy = labelCenterY - anchorY;
	const distance = Math.hypot(dx, dy);

	if (distance === 0) {
		return { x1: anchorX, y1: anchorY, x2: labelCenterX, y2: labelCenterY, distance: 0 };
	}

	const ux = dx / distance;
	const uy = dy / distance;

	const anchorEndX = anchorX + ux * anchorRadius;
	const anchorEndY = anchorY + uy * anchorRadius;

	const labelEdge = rectEdgeTowardPoint(labelCenterX, labelCenterY, bbox, anchorX, anchorY);
	const labelStartX = labelEdge.x - ux * edgeBuffer;
	const labelStartY = labelEdge.y - uy * edgeBuffer;

	return {
		x1: anchorEndX,
		y1: anchorEndY,
		x2: labelStartX,
		y2: labelStartY,
		distance,
	};
}
