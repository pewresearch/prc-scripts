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

	// Only clamp in a direction if the natural anchor (x0) was already inside
	// the boundary. Labels naturally placed at the chart edge (e.g. first/last
	// data-point labels at x≈0 or x≈innerWidth) have x0 outside minX/maxX —
	// clamping them every tick causes net inward drift because the forceX pull
	// (strength 0.35) can't overcome 160 rounds of hard clamping. SVG viewport
	// clips any actual off-screen rendering, so edge-label overflow is fine.
	if (node.x0 >= minX) {
		node.x = Math.max(node.x, minX);
	}
	if (node.x0 <= maxX) {
		node.x = Math.min(node.x, maxX);
	}

	// Y: always clamp both directions — labels drifting off the top or bottom
	// is never intentional and not handled by SVG clipping.
	const minY = padding - node.bboxOffsetY;
	const maxY = innerHeight - padding - node.bboxOffsetY - node.height;
	node.y = Math.min(Math.max(node.y, minY), maxY);
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

	const movable = inputs.filter((input) => !input.locked && input.text);
	if (movable.length < 2) {
		return result;
	}

	const lockedNodes: SimRectNode[] = inputs
		.filter((input) => input.locked && input.text)
		.map((input) => {
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

	for (const node of movableNodes) {
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
