export { computeLabelDeclutter } from './computeLabelDeclutter';
export { forceRectCollide } from './forceRectCollide';
export {
	FIRST_LAST_OUTSIDE_BASE_DX,
	buildLineChartLabelId,
	buildLineChartLabelInputs,
	getFirstLastLabelPlacement,
	getLineLabelContent,
} from './buildLineChartLabels';
export {
	buildOnLineSeriesLabelId,
	buildOnLineSeriesLabels,
	getDirectLabelOffsetFromCustom,
	getDirectLabelScaleFactors,
	getSeriesYAtPixelX,
	hasAuthorDirectLabelOverride,
	getStackedSeriesDependentValue,
} from './buildOnLineSeriesLabels';
export type { OnLineSeriesDeclutterInput } from './buildOnLineSeriesLabels';
export {
	buildAllDotPlotLabelInputs,
	buildDotPlotLabelId,
	buildScatterLabelId,
	buildScatterLabelInputs,
} from './buildScatterLabels';
export type { DotPlotGroupPosition } from './buildScatterLabels';
export {
	buildChartLabelId,
	getLabelMaxWidth,
	hasAuthorLabelOverride,
} from './helpers';
export {
	computeLeaderLineEndpoints,
	rectEdgeTowardPoint,
} from './leaderLineGeometry';
export { createLeaderLineStore } from './leaderLineStore';
export type {
	LeaderLineRegistration,
	LeaderLineStore,
} from './leaderLineStore';
export { measureLabelBBox, measureTextWidth, wordWrap } from './measureLabel';
export type { LabelBBox, MeasureLabelBBoxOptions } from './measureLabel';
export { resolveVerticalStacks } from './resolveVerticalStacks';
export type {
	ResolveVerticalStacksOptions,
	StackItem,
} from './resolveVerticalStacks';
