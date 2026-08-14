export type BeeSwarmLayoutMode = 'dodge' | 'force';

export type BeeSwarm = {
	layoutMode: BeeSwarmLayoutMode;
	groupBy: string | null;
	forceStrength: number;
	/** Max horizontal drift from anchor x in dodge mode (px). 0 = vertical stacks. */
	swarmSpread: number;
};
