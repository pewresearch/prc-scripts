export {
	computeWaffleCells,
	allocateWaffleCellCounts,
	resolveWaffleMax,
} from './computeWaffleCells';
export { computeWaffleLayout } from './computeWaffleLayout';
export {
	resolveWaffleCellSize,
	fitWaffleCellSize,
	waffleSpanFactor,
} from './resolveWaffleCellSize';
export { getWaffleCategoryInputs } from './getWaffleCategoryInputs';
export { computeWafflePanelRatios } from './computeWafflePanelRatios';
export type { WafflePanelValue } from './computeWafflePanelRatios';
export type {
	WaffleDisplayMode,
	WaffleCategoryInput,
	WaffleCategoryMeta,
	WaffleCell,
	ComputeWaffleCellsArgs,
	ComputeWaffleCellsResult,
} from './computeWaffleCells';
export type {
	ComputeWaffleLayoutArgs,
	WaffleLayout,
} from './computeWaffleLayout';
export type { ResolveWaffleCellSizeArgs } from './resolveWaffleCellSize';
