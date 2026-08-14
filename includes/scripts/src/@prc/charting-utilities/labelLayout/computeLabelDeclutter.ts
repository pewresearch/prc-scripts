/* eslint-disable jsdoc/require-param */
import { forceSimulation, forceX, forceY } from 'd3-force';

import type {
	DeclutterLabelInput,
	DeclutterOffset,
	DeclutterOptions,
	SimRectNode,
} from '../types/labels';
import { DEFAULT_FONT_FAMILY } from '../utilities/defaultFontFamily';

import { forceRectCollide } from './forceRectCollide';
import { measureLabelBBox } from './measureLabel';
import { resolveVerticalStacks } from './resolveVerticalStacks';
import type { StackItem } from './resolveVerticalStacks';

const DEFAULT_FONT_SIZE = 12;

function clampPosition(
	node: SimRectNode,
	innerWidth?: number,
	innerHeight?: number,
	padding = 0
) {
	if (
		innerWidth === null ||
		innerWidth === undefined ||
		innerHeight === null ||
		innerHeight === undefined
	) {
		return;
	}

	const minX = padding - node.bboxOffsetX;
	const maxX = innerWidth - padding - node.bboxOffsetX - node.width;

	// Only clamp in a direction if the natural anchor was already inside the
	// boundary. Labels at the chart edge (first/last point labels, series that
	// sit on the baseline) have anchors outside the padded box — clamping them
	// every tick causes net inward drift because the anchor pull can't overcome
	// hard clamping. SVG viewport clips overflow, so edge-label overhang is fine.
	if (node.x0 >= minX) {
		node.x = Math.max(node.x, minX);
	}
	if (node.x0 <= maxX) {
		node.x = Math.min(node.x, maxX);
	}

	const minY = padding - node.bboxOffsetY;
	const maxY = innerHeight - padding - node.bboxOffsetY - node.height;
	if (node.y0 >= minY) {
		node.y = Math.max(node.y, minY);
	}
	if (node.y0 <= maxY) {
		node.y = Math.min(node.y, maxY);
	}
}

/**
 * Synchronous label de-collision pass. Returns dx/dy offsets keyed by label id.
 * Author-locked labels keep their default offsets and are treated as immovable obstacles.
 */
export function computeLabelDeclutter(
	inputs: DeclutterLabelInput[],
	options: DeclutterOptions = {}
): Map<string, DeclutterOffset> {
	const result = new Map<string, DeclutterOffset>();
	const padding = options.padding ?? 4;
	const lockX = options.lockX ?? false;
	const lockY = options.lockY ?? false;
	const iterations = options.iterations ?? 120;
	const anchorStrengthX = options.anchorStrengthX ?? 0.3;
	const anchorStrengthY = options.anchorStrengthY ?? (lockY ? 0.6 : 0.35);

	for (const input of inputs) {
		result.set(input.id, {
			dx: input.defaultDx ?? 0,
			dy: input.defaultDy ?? 0,
		});
	}

	const omitWithin = options.omitWithin;
	const omittedIds = new Set<string>();
	if (omitWithin !== undefined && omitWithin > 0) {
		for (const id of selectCrowdedOmissions(
			inputs,
			omitWithin,
			options.omitEdgeWithin,
			options.innerHeight
		)) {
			omittedIds.add(id);
			result.set(id, {
				dx: 0,
				dy: 0,
				hidden: true,
			});
		}
	}

	const movable = inputs.filter(
		(input) => !input.locked && input.text && !omittedIds.has(input.id)
	);
	const locked = inputs.filter((input) => input.locked && input.text);
	if (movable.length === 0 || movable.length + locked.length < 2) {
		return result;
	}

	const lockedNodes: SimRectNode[] = locked.map((input) => {
		const fontSize = input.fontSize ?? DEFAULT_FONT_SIZE;
		const fontFamily = input.fontFamily ?? DEFAULT_FONT_FAMILY;
		const bbox = measureLabelBBox({
			text: input.text,
			fontSize,
			fontFamily,
			fontWeight: input.fontWeight,
			maxWidth: input.maxWidth,
			textAnchor: input.textAnchor,
			dominantBaseline: input.dominantBaseline,
		});
		const startX = input.x + (input.defaultDx ?? 0);
		const startY = input.y + (input.defaultDy ?? 0);
		return {
			id: input.id,
			x: startX,
			y: startY,
			x0: startX,
			y0: startY,
			vx: 0,
			vy: 0,
			fx: startX,
			fy: startY,
			width: bbox.width,
			height: bbox.height,
			bboxOffsetX: bbox.offsetX,
			bboxOffsetY: bbox.offsetY,
		};
	});

	const movableNodes: SimRectNode[] = movable.map((input) => {
		const fontSize = input.fontSize ?? DEFAULT_FONT_SIZE;
		const fontFamily = input.fontFamily ?? DEFAULT_FONT_FAMILY;
		const bbox = measureLabelBBox({
			text: input.text,
			fontSize,
			fontFamily,
			fontWeight: input.fontWeight,
			maxWidth: input.maxWidth,
			textAnchor: input.textAnchor,
			dominantBaseline: input.dominantBaseline,
		});
		const startX = input.x + (input.defaultDx ?? 0);
		const startY = input.y + (input.defaultDy ?? 0);
		return {
			id: input.id,
			x: startX,
			y: startY,
			x0: startX,
			y0: startY,
			vx: 0,
			vy: 0,
			fx: lockX ? startX : null,
			fy: lockY ? startY : null,
			width: bbox.width,
			height: bbox.height,
			bboxOffsetX: bbox.offsetX,
			bboxOffsetY: bbox.offsetY,
		};
	});

	const nodes = [...movableNodes, ...lockedNodes];

	const simulation = forceSimulation(nodes)
		.force(
			'x',
			lockX
				? null
				: forceX<SimRectNode>((node) => node.x0).strength(
						anchorStrengthX
					)
		)
		.force(
			'y',
			lockY
				? null
				: forceY<SimRectNode>((node) => node.y0).strength(
						anchorStrengthY
					)
		)
		.force(
			'collide',
			forceRectCollide<SimRectNode>({
				padding,
				strength: 1,
				iterations: 1,
			})
		)
		.stop();

	for (let i = 0; i < iterations; i++) {
		simulation.tick();
		for (const node of movableNodes) {
			clampPosition(
				node,
				options.innerWidth,
				options.innerHeight,
				padding
			);
			if (lockX) {
				node.x = node.x0;
			}
			if (lockY) {
				node.y = node.y0;
			}
		}
	}

	if (!lockY) {
		applyVerticalStackPass(nodes, movableNodes, padding);
	}

	for (const node of movableNodes) {
		clampPosition(node, options.innerWidth, options.innerHeight, padding);
		const input = movable.find((candidate) => candidate.id === node.id);
		if (!input) {
			continue;
		}
		result.set(node.id, {
			dx: node.x - input.x,
			dy: node.y - input.y,
		});
	}

	return result;
}

/**
 * Pick labels to hide when anchors pack tighter than `omitWithin`.
 *
 * Walks top-to-bottom and keeps a label only when it clears every already-kept
 * label by at least `omitWithin` on both axes. Author-locked labels are always
 * kept and reserve space for the rest.
 */
function selectCrowdedOmissions(
	inputs: DeclutterLabelInput[],
	omitWithin: number,
	omitEdgeWithin?: number,
	innerHeight?: number
): string[] {
	const candidates = inputs
		.filter((input) => input.text)
		.sort((a, b) => a.y - b.y || a.x - b.x);

	const kept: DeclutterLabelInput[] = [];
	const omitted: string[] = [];

	for (const input of candidates) {
		if (input.locked || !input.omittable) {
			kept.push(input);
			continue;
		}

		const crowded = kept.some(
			(other) =>
				Math.abs(input.x - other.x) < omitWithin &&
				Math.abs(input.y - other.y) < omitWithin
		);

		if (crowded) {
			omitted.push(input.id);
		} else {
			kept.push(input);
		}
	}

	if (
		omitEdgeWithin !== undefined &&
		omitEdgeWithin > 0 &&
		innerHeight !== undefined
	) {
		const omittedIds = new Set(omitted);
		for (const input of kept) {
			if (input.locked || !input.omittable) {
				continue;
			}

			const nearEdge =
				input.y <= omitEdgeWithin ||
				innerHeight - input.y <= omitEdgeWithin;
			if (!nearEdge) {
				continue;
			}

			const hasOmittedNeighbor = candidates.some(
				(other) =>
					omittedIds.has(other.id) &&
					Math.abs(input.x - other.x) < omitWithin &&
					Math.abs(input.y - other.y) < omitWithin
			);
			if (hasOmittedNeighbor) {
				omitted.push(input.id);
			}
		}
	}

	return omitted;
}

/**
 * Finish the layout with an exact stack solve.
 *
 * The simulation gets labels close, but it cannot separate boxes that the
 * boundary clamp holds at the same position, and it settles with residual
 * overlap wherever the anchor force matches the collide force. This pass takes
 * the simulation's horizontal result as final and re-solves the vertical axis
 * from each label's original anchor, so crowded series stack cleanly instead of
 * piling up.
 *
 * Plot bounds are not applied here — edge-anchored labels (baseline series,
 * first/last points) are allowed to overhang, matching `clampPosition`.
 */
function applyVerticalStackPass(
	nodes: SimRectNode[],
	movableNodes: SimRectNode[],
	padding: number
): void {
	if (nodes.length < 2 || movableNodes.length === 0) {
		return;
	}

	const movableIds = new Set(movableNodes.map((node) => node.id));

	const items: StackItem[] = nodes.map((node) => {
		const left = node.x + node.bboxOffsetX;
		return {
			id: node.id,
			left,
			right: left + node.width,
			top: node.y0 + node.bboxOffsetY,
			height: node.height,
			fixed: !movableIds.has(node.id),
		};
	});

	const offsets = resolveVerticalStacks(items, {
		gap: padding * 2,
	});

	for (const node of movableNodes) {
		node.y = node.y0 + (offsets.get(node.id) ?? 0);
	}
}
