export { computeHeatMapTableCells } from './computeHeatMapTableCells';
export type {
	HeatMapTableCell,
	ComputeHeatMapTableCellsArgs,
	ComputeHeatMapTableCellsResult,
} from './computeHeatMapTableCells';

export { computeHeatMapTableLayout } from './computeHeatMapTableLayout';
export type {
	ComputeHeatMapTableLayoutArgs,
	HeatMapTableLayout,
} from './computeHeatMapTableLayout';

export {
	createValueColorScale,
	resolveBinFill,
	resolveBinPaint,
	resolveSolidColor,
} from './createValueColorScale';
export {
	getThresholdLegendLabels,
	mapScaleStyleKey,
	thresholdBinLabel,
	thresholdLabelFill,
	thresholdLegendItems,
	DEFAULT_THRESHOLD_LABEL_LOWER,
	DEFAULT_THRESHOLD_LABEL_DELIMITER,
	DEFAULT_THRESHOLD_LABEL_UPPER,
} from './thresholdLegendLabels';
export type { ThresholdLegendLanguage } from './thresholdLegendLabels';
export type {
	BinMarkPaint,
	CreateValueColorScaleArgs,
	ResolveBinPaintDefaults,
	ValueColorScale,
	ValueColorScaleMode,
} from './createValueColorScale';
