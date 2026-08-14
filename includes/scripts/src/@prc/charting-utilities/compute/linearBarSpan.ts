type LinearScale = {
	(value: number): number | undefined;
	domain?: () => number[];
};

type LinearBarSpan = {
	start: number;
	size: number;
	baseline: number;
	valueAtStart: boolean;
};

const baselineValue = (scale: LinearScale): number => {
	const domain = scale.domain?.();
	if (!domain || domain.length < 2) {
		return 0;
	}
	const lo = Math.min(domain[0], domain[1]);
	const hi = Math.max(domain[0], domain[1]);
	return lo <= 0 && 0 <= hi ? 0 : lo;
};

const linearBarBaseline = (scale: LinearScale): number => {
	const floor = baselineValue(scale);
	return scale(floor) ?? 0;
};

const linearBarSpan = (scale: LinearScale, value: number): LinearBarSpan => {
	const zero = linearBarBaseline(scale);
	const edge = scale(value) ?? zero;
	return {
		start: Math.min(zero, edge),
		size: Math.abs(edge - zero),
		baseline: zero,
		valueAtStart: edge <= zero,
	};
};

export { linearBarSpan, linearBarBaseline };
