/**
 * Deterministic vertical separation for labels that share horizontal space.
 *
 * The force simulation resolves most collisions, but it stalls in two cases the
 * eye notices immediately: labels pinned against the plot boundary (the clamp
 * cancels the repulsion every tick) and tight clusters where the anchor force
 * balances the collide force before the boxes come apart. This pass runs after
 * the simulation and solves each horizontal cluster exactly.
 */

export interface StackItem {
	id: string;
	/** Left edge of the label box. */
	left: number;
	/** Right edge of the label box. */
	right: number;
	/** Preferred top edge of the label box. */
	top: number;
	height: number;
	/** Author-placed labels act as immovable obstacles. */
	fixed?: boolean;
}

export interface ResolveVerticalStacksOptions {
	/** Minimum empty space between two boxes. */
	gap?: number;
	/** Top edge of the allowed region. */
	minTop?: number;
	/** Bottom edge of the allowed region. */
	maxBottom?: number;
}

/** Weight that keeps author-placed labels effectively immovable in the solve. */
const FIXED_WEIGHT = 1e6;

interface Block {
	value: number;
	weight: number;
	weightedSum: number;
	count: number;
}

/**
 * Group items into clusters that share horizontal space, so labels sitting side
 * by side are never stacked against each other.
 *
 * @param items Label boxes to cluster.
 * @param gap   Minimum empty space between two boxes.
 * @return Clusters of items, each sorted by preferred top edge.
 */
function clusterByHorizontalOverlap(
	items: StackItem[],
	gap: number
): StackItem[][] {
	const sorted = [...items].sort((a, b) => a.left - b.left);
	const clusters: StackItem[][] = [];
	let current: StackItem[] = [];
	let currentRight = -Infinity;

	for (const item of sorted) {
		if (current.length > 0 && item.left >= currentRight + gap) {
			clusters.push(current);
			current = [];
			currentRight = -Infinity;
		}
		current.push(item);
		currentRight = Math.max(currentRight, item.right);
	}

	if (current.length > 0) {
		clusters.push(current);
	}

	return clusters;
}

/**
 * Weighted isotonic regression (pool adjacent violators).
 *
 * Stacking `n` boxes without overlap is the same problem as fitting a
 * non-decreasing sequence once each box's preferred top is shifted down by the
 * cumulative height of the boxes above it. Solving it this way moves every
 * label the smallest total distance that still clears the overlap.
 *
 * @param values  Preferred positions in the shifted coordinate space.
 * @param weights Resistance to movement per item.
 * @return Non-decreasing positions in the shifted coordinate space.
 */
function poolAdjacentViolators(values: number[], weights: number[]): number[] {
	const blocks: Block[] = [];

	for (let i = 0; i < values.length; i++) {
		const weight = weights[i];
		let block: Block = {
			value: values[i],
			weight,
			weightedSum: values[i] * weight,
			count: 1,
		};

		while (
			blocks.length > 0 &&
			blocks[blocks.length - 1].value > block.value
		) {
			const previous = blocks.pop() as Block;
			const weightSum = previous.weight + block.weight;
			const weightedSum = previous.weightedSum + block.weightedSum;
			block = {
				value: weightedSum / weightSum,
				weight: weightSum,
				weightedSum,
				count: previous.count + block.count,
			};
		}

		blocks.push(block);
	}

	const result: number[] = [];
	for (const block of blocks) {
		for (let i = 0; i < block.count; i++) {
			result.push(block.value);
		}
	}

	return result;
}

/**
 * Push a solved stack back inside the plot area without disturbing labels that
 * already fit. Only the run of boxes touching a boundary gets moved.
 *
 * @param tops      Solved top edges, ordered top to bottom.
 * @param heights   Box heights in the same order.
 * @param gap       Minimum empty space between two boxes.
 * @param minTop    Top edge of the allowed region.
 * @param maxBottom Bottom edge of the allowed region.
 */
function applyBounds(
	tops: number[],
	heights: number[],
	gap: number,
	minTop?: number,
	maxBottom?: number
): void {
	if (maxBottom !== undefined) {
		for (let i = tops.length - 1; i >= 0; i--) {
			const limit =
				i === tops.length - 1
					? maxBottom - heights[i]
					: Math.min(
							maxBottom - heights[i],
							tops[i + 1] - gap - heights[i]
						);
			if (tops[i] > limit) {
				tops[i] = limit;
			}
		}
	}

	if (minTop !== undefined) {
		for (let i = 0; i < tops.length; i++) {
			const limit =
				i === 0
					? minTop
					: Math.max(minTop, tops[i - 1] + heights[i - 1] + gap);
			if (tops[i] < limit) {
				tops[i] = limit;
			}
		}
	}
}

/**
 * Resolve vertical overlaps for every horizontal cluster of labels.
 *
 * @param items   Label boxes at their preferred positions.
 * @param options Gap and plot-area bounds.
 * @return Vertical offsets keyed by label id; ids that need no move are omitted.
 */
export function resolveVerticalStacks(
	items: StackItem[],
	options: ResolveVerticalStacksOptions = {}
): Map<string, number> {
	const gap = options.gap ?? 0;
	const offsets = new Map<string, number>();

	for (const cluster of clusterByHorizontalOverlap(items, gap)) {
		if (cluster.length < 2) {
			continue;
		}

		const ordered = [...cluster].sort((a, b) => a.top - b.top);
		const heights = ordered.map((item) => item.height);
		const weights = ordered.map((item) => (item.fixed ? FIXED_WEIGHT : 1));

		// Shift each preferred top up by the space the boxes above it occupy, so
		// "no overlap" becomes "non-decreasing".
		let prefix = 0;
		const shifted = ordered.map((item, index) => {
			const value = item.top - prefix;
			prefix += heights[index] + gap;
			return value;
		});

		const solved = poolAdjacentViolators(shifted, weights);

		prefix = 0;
		const tops = solved.map((value, index) => {
			const top = value + prefix;
			prefix += heights[index] + gap;
			return top;
		});

		applyBounds(tops, heights, gap, options.minTop, options.maxBottom);

		ordered.forEach((item, index) => {
			if (item.fixed) {
				return;
			}
			const delta = tops[index] - item.top;
			if (delta !== 0) {
				offsets.set(item.id, delta);
			}
		});
	}

	return offsets;
}
