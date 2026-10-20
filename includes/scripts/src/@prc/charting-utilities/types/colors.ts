import type { Pattern } from './pattern';
import type { LabelStyleOverride } from './labels';

export type Colors = string[];

export interface CategoryStyle {
	fill?: string;
	stroke?: string;
	opacity?: number;
	strokeWidth?: number;
	pointSize?: number;
	pointFill?: string;
	pointFillOpacity?: number;
	fillOpacity?: number;
	pointStrokeWidth?: number;
	strokeOpacity?: number;
	strokeDasharray?: string;
	strokeDashoffset?: number;
	pattern?: Pattern;
	fillSource?: 'palette' | 'custom';
	label?: LabelStyleOverride;
	labelsVisible?: boolean;
}

export type SeriesStyle = CategoryStyle;
