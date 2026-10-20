/**
 * Series hatch, matching visx `@visx/pattern` props except `id`.
 * The renderer assigns the SVG id from the category name.
 *
 * String presets (`striped`, `dotted`, `crosshatch`) keep the inspector
 * simple. Object forms carry tile size, orientation, and stroke.
 */

export type PatternOrientation =
	| 'horizontal'
	| 'vertical'
	| 'diagonal'
	| 'diagonalRightToLeft';

export type PatternStrokeLinecap = 'square' | 'butt' | 'round' | 'inherit';

export type PatternPreset = 'solid';

type PatternTile = {
	width?: number;
	height?: number;
	background?: string;
};

type PatternStroke = {
	stroke?: string;
	strokeWidth?: number | string;
	strokeDasharray?: string | number;
	strokeLinecap?: PatternStrokeLinecap;
	shapeRendering?: string | number;
};

export type LinesPattern = PatternTile &
	PatternStroke & {
		type: 'lines' | 'striped' | 'crosshatch';
		orientation?: PatternOrientation[];
	};

export type CirclesPattern = PatternTile & {
	type: 'circles' | 'dotted';
	radius?: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number | string;
	strokeDasharray?: number | string;
	complement?: boolean;
};

export type WavesPattern = PatternTile &
	PatternStroke & {
		type: 'waves';
		fill?: string;
	};

export type HexagonsPattern = Omit<PatternTile, 'width'> &
	PatternStroke & {
		type: 'hexagons';
		size?: number;
		fill?: string;
	};

export type PathPattern = PatternTile &
	PatternStroke & {
		type: 'path';
		path?: string;
		fill?: string;
	};

export type PatternSpec =
	| LinesPattern
	| CirclesPattern
	| WavesPattern
	| HexagonsPattern
	| PathPattern;

/** Hatch types supported by {@link PatternDef} in the charting library. */
export type HatchPatternType = PatternSpec['type'];

export type Pattern = PatternPreset | HatchPatternType | PatternSpec;
