const domainCrossesZero = (domain: number[]): boolean => {
	if (domain.length < 2) {
		return false;
	}
	return Math.min(...domain) < 0 && Math.max(...domain) > 0;
};

export { domainCrossesZero };
