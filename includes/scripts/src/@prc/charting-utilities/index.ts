// Types
export * from './types/animate';
export * from './types/animation';
export * from './types/bar';
export * from './types/colors';
export * from './types/configTypes';
export * from './types/custom';
export * from './types/dataRender';
export * from './types/dateFormat';
export * from './types/dependentAxis';
export * from './types/diffColumn';
export * from './types/divergingBar';
export * from './types/dotPlot';
export * from './types/errorBars';
export * from './types/events';
export * from './types/explodedBar';
export * from './types/featureShape';
export * from './types/flatData';
export * from './types/independentAxis';
export * from './types/keys';
export * from './types/labels';
export * from './types/layout';
export * from './types/legend';
export * from './types/line';
export * from './types/map';
export * from './types/metadata';
export * from './types/netValues';
export * from './types/nodes';
export * from './types/pie';
export * from './types/plotBands';
export * from './types/shapes';
export * from './types/regressionLine';
export * from './types/stack';
export * from './types/tableData';
export * from './types/text';
export * from './types/tooltip';
export * from './types/voronoi';
export * from './types/windowSize';
export * from './types/drawings';
export * from './types/treemap';
export * from './types/sankey';

// React hooks
export {
	useSize,
	useDarkMode,
	useLocalStorage,
	useMedia,
	useRegressionLine,
	useRegressionLines,
	useWorldCountryData,
	useStateData,
	useStateGridData,
	findStateDataRow,
	fipsToStateAbbr,
} from './hooks';
export type {
	UseWorldCountryDataArgs,
	UseWorldCountryDataResult,
	UseStateDataArgs,
	UseStateDataResult,
	UseStateGridDataArgs,
	StateGridBin,
	StateGridColumn,
} from './hooks';

// Pure utilities
export { DEFAULT_FONT_FAMILY } from './utilities/defaultFontFamily';
export { default as baseConfig } from './utilities/baseConfig';
export {
	randomDataPoints,
	randomDate,
	randomDataTime,
	randomDataPointsCountries,
} from './utilities/randomData';
export {
	abbreviateNumber,
	labelFill,
	contrastLabelFillForLightDark,
	LABEL_OUTLINE_COLOR,
	getLabelFill,
	getLabelOutlineStroke,
	getBarLabelFill,
	newDateByFormat,
	checkContrast,
	scaleAxisNumTicks,
	decodeHtmlEntities,
	getCustomLabel,
	getCustomLabelText,
	isLabelVisible,
	getCustomLabelStyle,
	getCustomTooltip,
	getGroupValue,
	generateElementKey,
	resolveLabelCutoff,
	resolveTextOutlineMode,
} from './utilities/helpers';
export {
	resolveCategoryColor,
	resolveCategoryOpacity,
	withCategoryOpacity,
	legendCategoryShapeStyle,
} from './utilities/resolveCategoryColor';
export { DataContext, DataProvider } from './utilities/DataContext';
export { createTopologyLoader } from './utilities/loadTopology';
export { MAP_REGION_PRESETS } from './utilities/mapRegionPresets';
export type { MapRegionPreset } from './utilities/mapRegionPresets';
export * from './utilities/colorPalettes';
export {
	REGRESSION_FNS,
	getRegressionFn,
	computeRegressionStats,
} from './utilities/regression';
export type { RegressionPoint, RegressionStats } from './utilities/regression';

// Label layout engine (framework-agnostic)
export {
	computeLabelDeclutter,
	forceRectCollide,
	buildLineChartLabelId,
	buildLineChartLabelInputs,
	getLineLabelContent,
	buildOnLineSeriesLabelId,
	buildOnLineSeriesLabels,
	getDirectLabelOffsetFromCustom,
	getDirectLabelScaleFactors,
	getSeriesYAtPixelX,
	hasAuthorDirectLabelOverride,
	buildAllDotPlotLabelInputs,
	buildDotPlotLabelId,
	buildScatterLabelId,
	buildScatterLabelInputs,
	buildChartLabelId,
	getLabelMaxWidth,
	hasAuthorLabelOverride,
	getStackedSeriesDependentValue,
	computeLeaderLineEndpoints,
	rectEdgeTowardPoint,
	createLeaderLineStore,
	measureLabelBBox,
	measureTextWidth,
	wordWrap,
} from './labelLayout';
export type {
	OnLineSeriesDeclutterInput,
	DotPlotGroupPosition,
	LeaderLineRegistration,
	LeaderLineStore,
	LabelBBox,
	MeasureLabelBBoxOptions,
} from './labelLayout';

// Compute (headless prop + data builders)
export {
	getSharedProps,
	getAria,
	getAxisProps,
	getGridProps,
	getLabelFormat,
	getLabelProps,
	positionBarLabel,
	getLegendProps,
	getLineProps,
	getChartDimensions,
	getLocalPoint,
	getTooltipFormat,
	getTooltipHeaderFormat,
	getTooltipVisible,
	getTooltipMapDeemphasisProps,
	getTextVisible,
	getVoronoiProps,
	getFlattenedData,
	getGroupedData,
	getGroupPositioningHorizontal,
	getGroupPositioningVertical,
	getGroupPositioningPie,
} from './compute';
export type {
	GroupedData,
	GroupPositioning,
	PieGroupPositioning,
} from './compute/data';
