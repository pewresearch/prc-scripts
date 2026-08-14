export { enrichFacetRow, isFacetMetaKey } from './enrichFacetRow';
export { facetDataByColumn, deriveCategories } from './facetDataByColumn';
export type { SmallMultiplesPanel } from './facetDataByColumn';
export { facetDataByGroup } from './facetDataByGroup';
export type {
	SmallMultiplesGroupPanel,
	SmallMultiplesSeries,
} from './facetDataByGroup';
export { computeSharedDomain } from './computeSharedDomain';
export type { SharedDomainOptions } from './computeSharedDomain';
export {
	computePanelRects,
	computeGridHeight,
	resolveEffectiveColumns,
} from './computePanelRects';
export type {
	PanelRect,
	ComputePanelRectsArgs,
	ComputePanelRectsResult,
	ComputeGridHeightArgs,
	ResolveEffectiveColumnsArgs,
} from './computePanelRects';
export { resolvePanelRect } from './resolvePanelRect';
export type { PanelLike } from './resolvePanelRect';
export { planPanelAxes } from './planPanelAxes';
export type {
	AxisTreatment,
	PanelOrientation,
	PlanPanelAxesArgs,
	PanelAxisPlan,
} from './planPanelAxes';
export type { SmallMultiplesAxisTreatment } from '../types/smallMultiples';
export {
	computeColumnBarRects,
	resolveBandDomain,
} from './computeColumnBarRects';
export type {
	ColumnBarRect,
	ComputeColumnBarRectsArgs,
} from './computeColumnBarRects';
export {
	computeHorizontalBarRects,
	computeBarPanelHeight,
} from './computeHorizontalBarRects';
export type {
	HorizontalBarRect,
	ComputeHorizontalBarRectsArgs,
	ComputeBarPanelHeightArgs,
} from './computeHorizontalBarRects';
export { resolveSliceDomain } from './resolveSliceDomain';
export { resolveShapePaint } from './resolveShapePaint';
export type { ShapePaint, ShapePaintDefaults } from './resolveShapePaint';
export { generateSegmentKey, resolveSegmentPaint } from './resolveSegmentPaint';
export type { SegmentPaint, SegmentPaintDefaults } from './resolveSegmentPaint';
export { resolveGhostStroke } from './resolveGhostStroke';
export type {
	ResolveGhostStrokeArgs,
	ResolvedGhostPaint,
} from './resolveGhostStroke';
