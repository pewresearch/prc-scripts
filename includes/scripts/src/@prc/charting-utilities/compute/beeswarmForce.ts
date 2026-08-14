import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import type { DodgeCircle } from '../utilities/dodge';
import type { FlatData } from '../types/flatData';

const FORCE_TICK_COUNT = 120;

export type BeeswarmForceOptions<T> = {
	data: T[];
	getX: (datum: T) => number;
	getRadius: (datum: T) => number;
	getGroupKey?: (datum: T) => string | null;
	groupCenters?: Map<string, number>;
	centerY: number;
	strength: number;
	collidePadding?: number;
};

type ForceNode<T> = {
	data: T;
	x: number;
	y: number;
	r: number;
};

export function computeBeeswarmForce<T>({
	data,
	getX,
	getRadius,
	getGroupKey,
	groupCenters,
	centerY,
	strength,
	collidePadding = 1,
}: BeeswarmForceOptions<T>): DodgeCircle<T>[] {
	const simNodes: ForceNode<T>[] = data.map((datum) => ({
		data: datum,
		x: getX(datum),
		y: centerY,
		r: getRadius(datum),
	}));

	const simulation = forceSimulation(simNodes)
		.force(
			'x',
			forceX<ForceNode<T>>((node) => getX(node.data)).strength(strength)
		)
		.force(
			'y',
			forceY<ForceNode<T>>((node) => {
				if (getGroupKey && groupCenters) {
					const groupKey = getGroupKey(node.data);
					if (groupKey && groupCenters.has(groupKey)) {
						return groupCenters.get(groupKey)!;
					}
				}
				return centerY;
			}).strength(strength)
		)
		.force(
			'collide',
			forceCollide<ForceNode<T>>(
				(node) => node.r + collidePadding
			).strength(1)
		)
		.stop();

	for (let i = 0; i < FORCE_TICK_COUNT; i += 1) {
		simulation.tick();
	}

	return simNodes.map((node) => ({
		x: node.x,
		y: centerY - node.y,
		radius: node.r,
		data: node.data,
	}));
}

export function buildBeeswarmGroupCenters(
	data: FlatData[],
	groupBy: string,
	innerHeight: number
): Map<string, number> {
	const groups = new Set<string>();
	data.forEach((row) => {
		const value = row[groupBy];
		if (value !== null && value !== undefined && value !== '') {
			groups.add(String(value));
		}
	});

	const sortedGroups = Array.from(groups).sort();
	const centers = new Map<string, number>();
	const step = innerHeight / (sortedGroups.length + 1);

	sortedGroups.forEach((group, index) => {
		centers.set(group, step * (index + 1));
	});

	return centers;
}
