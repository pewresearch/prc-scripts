/**
 * Shapes configuration type.
 *
 * Defines custom styling for individual chart shapes (bars, circles, paths, etc.)
 */

import type { CategoryStyle } from './colors';

export type ShapeCustomStyle = CategoryStyle;

/**
 * Segment-specific custom styling for line chart segments.
 */
export type SegmentCustomStyle = Pick<
	CategoryStyle,
	| 'stroke'
	| 'strokeWidth'
	| 'strokeOpacity'
	| 'opacity'
	| 'strokeDasharray'
	| 'strokeDashoffset'
>;

export type Shapes = {
	customStyles: {
		[key: string]: ShapeCustomStyle;
	};
	segmentStyles?: {
		[key: string]: SegmentCustomStyle;
	};
	segmentsActive?: boolean;
};
