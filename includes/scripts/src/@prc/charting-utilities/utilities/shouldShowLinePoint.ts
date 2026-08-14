type LinePointVisibility = {
	showPoints: boolean;
	showFirstLastPointsOnly?: boolean;
	index: number;
	pointCount: number;
};

const shouldShowLinePoint = ({
	showPoints,
	showFirstLastPointsOnly = false,
	index,
	pointCount,
}: LinePointVisibility): boolean => {
	if (!showPoints) {
		return false;
	}
	if (!showFirstLastPointsOnly) {
		return true;
	}
	return index === 0 || index === pointCount - 1;
};

export { shouldShowLinePoint };
