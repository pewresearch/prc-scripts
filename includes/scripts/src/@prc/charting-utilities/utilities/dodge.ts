/**
 * Beeswarm dodge layout — places circles along x without overlap.
 * With `spread > 0`, dots may drift horizontally from their anchor x to form
 * pill-shaped swarms instead of single-file vertical stacks.
 * Ported from d3 beeswarm examples (see media-brands-beeswarm/dodge.js).
 */

export type DodgeCircle<T> = {
	x: number;
	y: number;
	radius: number;
	data: T;
	next?: DodgeCircle<T> | null;
};

export type DodgeOptions<T> = {
	radius: (datum: T) => number;
	x: (datum: T) => number;
	safetyMargin?: number;
	/** Max horizontal drift from anchor x (px). 0 = y-offset only (vertical stacks). */
	spread?: number;
};

type PlacedCircle<T> = DodgeCircle<T> & {
	anchorX: number;
};

function circlesIntersect<T>(
	testX: number,
	testY: number,
	testRadius: number,
	placed: PlacedCircle<T>[],
	safetyMargin: number,
	epsilon: number
): boolean {
	for (const node of placed) {
		const dx = node.x - testX;
		const dy = node.y - testY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const combinedRadius = (testRadius + node.radius) * safetyMargin;

		if (distance < combinedRadius - epsilon) {
			return true;
		}
	}
	return false;
}

function findSwarmPosition<T>(
	anchorX: number,
	radius: number,
	placed: PlacedCircle<T>[],
	spread: number,
	safetyMargin: number,
	epsilon: number,
	maxSearchY: number
): { x: number; y: number } {
	if (!circlesIntersect(anchorX, 0, radius, placed, safetyMargin, epsilon)) {
		return { x: anchorX, y: 0 };
	}

	let bestX = anchorX;
	let bestY = 0;
	let bestCost = Infinity;
	let found = false;

	for (let dy = 0; dy <= maxSearchY; dy += 1) {
		const yLevels = dy === 0 ? [0] : [dy, -dy];

		for (const y of yLevels) {
			for (let dx = 0; dx <= spread; dx += 1) {
				const xOffsets = dx === 0 ? [0] : [-dx, dx];

				for (const xOffset of xOffsets) {
					const px = anchorX + xOffset;
					if (Math.abs(xOffset) > spread) {
						continue;
					}
					if (
						circlesIntersect(
							px,
							y,
							radius,
							placed,
							safetyMargin,
							epsilon
						)
					) {
						continue;
					}

					const cost = y * y + xOffset * xOffset * 0.35;
					if (cost < bestCost) {
						bestCost = cost;
						bestX = px;
						bestY = y;
						found = true;
					}
				}
			}
		}

		if (found) {
			return { x: bestX, y: bestY };
		}
	}

	return { x: anchorX, y: 0 };
}

function dodgeVertical<T>(
	data: T[],
	radius: (datum: T) => number,
	x: (datum: T) => number,
	safetyMargin: number
): DodgeCircle<T>[] {
	const circles: DodgeCircle<T>[] = data
		.map((datum) => ({
			x: x(datum),
			y: 0,
			radius: radius(datum),
			data: datum,
		}))
		.sort((a, b) => a.x - b.x);

	const epsilon = 1e-2;
	let head: DodgeCircle<T> | null = null;
	let tail: DodgeCircle<T> | null = null;

	function intersects(
		testX: number,
		testY: number,
		testRadius: number
	): boolean {
		let node = head;
		while (node) {
			const dx = node.x - testX;
			const dy = node.y - testY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const combinedRadius = (testRadius + node.radius) * safetyMargin;

			if (distance < combinedRadius - epsilon) {
				return true;
			}
			node = node.next ?? null;
		}
		return false;
	}

	for (const circle of circles) {
		const circleRadius = circle.radius;

		while (
			head &&
			head.x < circle.x - (circleRadius + head.radius) * safetyMargin
		) {
			head = head.next ?? null;
		}

		if (intersects(circle.x, circle.y, circleRadius)) {
			let node = head;
			circle.y = Infinity;

			while (node) {
				const combinedRadius =
					(circleRadius + node.radius) * safetyMargin;
				const dx = node.x - circle.x;
				const horizontalDistance = Math.abs(dx);

				if (horizontalDistance < combinedRadius) {
					const verticalDistance = Math.sqrt(
						combinedRadius * combinedRadius - dx * dx
					);
					const y1 = node.y + verticalDistance;
					const y2 = node.y - verticalDistance;

					if (
						Math.abs(y1) < Math.abs(circle.y) &&
						!intersects(circle.x, y1, circleRadius)
					) {
						circle.y = y1;
					}
					if (
						Math.abs(y2) < Math.abs(circle.y) &&
						!intersects(circle.x, y2, circleRadius)
					) {
						circle.y = y2;
					}
				}
				node = node.next ?? null;
			}
		}

		circle.next = null;
		if (head === null) {
			head = tail = circle;
		} else {
			tail!.next = circle;
			tail = circle;
		}
	}

	return circles;
}

function dodgeWithSpread<T>(
	data: T[],
	radius: (datum: T) => number,
	x: (datum: T) => number,
	spread: number,
	safetyMargin: number
): DodgeCircle<T>[] {
	const epsilon = 1e-2;
	const sorted = [...data].sort((a, b) => x(a) - x(b));
	const placed: PlacedCircle<T>[] = [];
	const maxRadius =
		sorted.reduce((maxR, datum) => Math.max(maxR, radius(datum)), 0) || 8;
	const maxSearchY = Math.max(maxRadius * sorted.length, maxRadius * 4);

	for (const datum of sorted) {
		const anchorX = x(datum);
		const r = radius(datum);
		const { x: px, y: py } = findSwarmPosition(
			anchorX,
			r,
			placed,
			spread,
			safetyMargin,
			epsilon,
			maxSearchY
		);

		placed.push({
			anchorX,
			x: px,
			y: py,
			radius: r,
			data: datum,
		});
	}

	return placed.map(({ anchorX: _anchorX, ...circle }) => circle);
}

export function dodge<T>(
	data: T[],
	{ radius, x, safetyMargin = 1.15, spread = 0 }: DodgeOptions<T>
): DodgeCircle<T>[] {
	if (spread <= 0) {
		return dodgeVertical(data, radius, x, safetyMargin);
	}

	return dodgeWithSpread(data, radius, x, spread, safetyMargin);
}
