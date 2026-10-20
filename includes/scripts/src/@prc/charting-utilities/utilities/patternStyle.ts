import type {
	CirclesPattern,
	HatchPatternType,
	HexagonsPattern,
	LinesPattern,
	PathPattern,
	Pattern,
	PatternSpec,
	WavesPattern,
} from '../types/pattern';
import { isHatchingPattern } from './resolvePatternFill';

/** Inspector-only value for `{ type: 'lines', orientation: ['horizontal'] }`. */
export const PATTERN_EDITOR_LINES_HORIZONTAL = 'lines-horizontal';

export const HATCH_PATTERN_TYPES = [
	'lines',
	'striped',
	'crosshatch',
	'dotted',
	'circles',
	'waves',
] as const satisfies readonly HatchPatternType[];

function isPatternSpecObject(
	pattern: Pattern | null | undefined
): pattern is PatternSpec {
	return typeof pattern === 'object' && pattern !== null;
}

function isFillPrimaryType(
	type: HatchPatternType
): type is 'circles' | 'dotted' | 'hexagons' {
	return type === 'circles' || type === 'dotted' || type === 'hexagons';
}

function isLinesFamilyType(
	type: HatchPatternType
): type is 'lines' | 'striped' | 'crosshatch' {
	return type === 'lines' || type === 'striped' || type === 'crosshatch';
}

function emptySpecForType(type: HatchPatternType): PatternSpec {
	if (isLinesFamilyType(type)) {
		return { type };
	}

	if (type === 'circles' || type === 'dotted') {
		return { type };
	}

	if (type === 'waves') {
		return { type: 'waves' };
	}

	if (type === 'hexagons') {
		return { type: 'hexagons' };
	}

	return { type: 'path' };
}

function specForType(
	pattern: Pattern | null | undefined,
	type: HatchPatternType
): PatternSpec {
	if (isPatternSpecObject(pattern) && pattern.type === type) {
		return { ...pattern };
	}

	return emptySpecForType(type);
}

function readFillPrimaryPaint(spec: PatternSpec): string | undefined {
	if (
		spec.type === 'circles' ||
		spec.type === 'dotted' ||
		spec.type === 'hexagons'
	) {
		return spec.fill;
	}

	return undefined;
}

function readStrokePrimaryPaint(spec: PatternSpec): string | undefined {
	if (isLinesFamilyType(spec.type)) {
		return spec.stroke;
	}

	if (spec.type === 'waves' || spec.type === 'path') {
		return spec.stroke;
	}

	return undefined;
}

function setFillPrimaryPaint(
	spec: PatternSpec,
	color: string | undefined
): PatternSpec {
	if (spec.type === 'circles' || spec.type === 'dotted') {
		const next: CirclesPattern = { ...spec };

		if (color) {
			next.fill = color;
		} else {
			delete next.fill;
		}

		return next;
	}

	if (spec.type === 'hexagons') {
		const next: HexagonsPattern = { ...spec };

		if (color) {
			next.fill = color;
		} else {
			delete next.fill;
		}

		return next;
	}

	return spec;
}

function setStrokePrimaryPaint(
	spec: PatternSpec,
	color: string | undefined
): PatternSpec {
	if (isLinesFamilyType(spec.type)) {
		const next: LinesPattern = { ...(spec as LinesPattern) };

		if (color) {
			next.stroke = color;
		} else {
			delete next.stroke;
		}

		return next;
	}

	if (spec.type === 'waves') {
		const next: WavesPattern = { ...(spec as WavesPattern) };

		if (color) {
			next.stroke = color;
		} else {
			delete next.stroke;
		}

		return next;
	}

	if (spec.type === 'path') {
		const next: PathPattern = { ...(spec as PathPattern) };

		if (color) {
			next.stroke = color;
		} else {
			delete next.stroke;
		}

		return next;
	}

	return spec;
}

function setPrimaryPaintOnSpec(
	spec: PatternSpec,
	type: HatchPatternType,
	color: string | undefined
): PatternSpec {
	if (isFillPrimaryType(type)) {
		return setFillPrimaryPaint(spec, color);
	}

	return setStrokePrimaryPaint(spec, color);
}

function readPrimaryPaintFromSpec(spec: PatternSpec): string | undefined {
	if (isFillPrimaryType(spec.type)) {
		return readFillPrimaryPaint(spec);
	}

	return readStrokePrimaryPaint(spec);
}

function setStrokeWidthOnSpec(
	spec: PatternSpec,
	strokeWidth: number | undefined
): PatternSpec {
	if (!patternSupportsStrokeWidth(spec.type)) {
		return spec;
	}

	if (isLinesFamilyType(spec.type)) {
		const next: LinesPattern = { ...(spec as LinesPattern) };

		if (strokeWidth === undefined) {
			delete next.strokeWidth;
		} else {
			next.strokeWidth = strokeWidth;
		}

		return next;
	}

	if (spec.type === 'waves') {
		const next: WavesPattern = { ...(spec as WavesPattern) };

		if (strokeWidth === undefined) {
			delete next.strokeWidth;
		} else {
			next.strokeWidth = strokeWidth;
		}

		return next;
	}

	if (spec.type === 'hexagons') {
		const next: HexagonsPattern = { ...(spec as HexagonsPattern) };

		if (strokeWidth === undefined) {
			delete next.strokeWidth;
		} else {
			next.strokeWidth = strokeWidth;
		}

		return next;
	}

	const next: PathPattern = { ...(spec as PathPattern) };

	if (strokeWidth === undefined) {
		delete next.strokeWidth;
	} else {
		next.strokeWidth = strokeWidth;
	}

	return next;
}

function collapsePatternSpec(spec: PatternSpec): Pattern {
	const { type, ...rest } = spec;
	const keys = Object.keys(rest);

	if (keys.length === 0) {
		return type;
	}

	return spec;
}

function hatchTypeFromPattern(
	pattern: Pattern | null | undefined
): HatchPatternType | undefined {
	const type = getPatternType(pattern);

	if (type === 'solid') {
		return undefined;
	}

	return type;
}

/**
 * Hatch pattern type, or solid when none is set.
 *
 * @param pattern Series pattern value.
 */
export function getPatternType(
	pattern: Pattern | null | undefined
): 'solid' | HatchPatternType {
	if (!pattern || pattern === 'solid') {
		return 'solid';
	}

	if (typeof pattern === 'string') {
		return pattern;
	}

	return pattern.type;
}

/**
 * Primary author-facing paint key for a hatch type in the charting-library
 * pattern primitive.
 *
 * @param type Hatch pattern type.
 */
export function patternPrimaryPaintField(
	type: HatchPatternType
): 'stroke' | 'fill' {
	return isFillPrimaryType(type) ? 'fill' : 'stroke';
}

/**
 * Whether the hatch type exposes a meaningful `strokeWidth` on its tile.
 *
 * @param type Hatch pattern type.
 */
export function patternSupportsStrokeWidth(type: HatchPatternType): boolean {
	return type !== 'circles' && type !== 'dotted';
}

/**
 * Read the hatch stroke or fill the author set on a pattern spec.
 *
 * @param pattern Series pattern value.
 */
export function readPatternPrimaryPaint(
	pattern: Pattern | null | undefined
): string | undefined {
	if (!isPatternSpecObject(pattern)) {
		return undefined;
	}

	return readPrimaryPaintFromSpec(pattern);
}

function isHorizontalLinesPattern(
	pattern: Pattern | null | undefined
): boolean {
	return (
		isPatternSpecObject(pattern) &&
		pattern.type === 'lines' &&
		pattern.orientation?.length === 1 &&
		pattern.orientation[0] === 'horizontal'
	);
}

/**
 * Pattern dropdown value for the series paint panel.
 *
 * @param pattern Series pattern value.
 */
export function getPatternEditorOption(
	pattern: Pattern | null | undefined
): string {
	if (!pattern || pattern === 'solid') {
		return 'solid';
	}

	if (isHorizontalLinesPattern(pattern)) {
		return PATTERN_EDITOR_LINES_HORIZONTAL;
	}

	if (typeof pattern === 'string') {
		return pattern;
	}

	return pattern.type;
}

/**
 * Series pattern from a pattern dropdown value.
 *
 * @param pattern Current pattern value.
 * @param option  Dropdown value, including {@link PATTERN_EDITOR_LINES_HORIZONTAL}.
 */
export function patternFromEditorOption(
	pattern: Pattern | null | undefined,
	option: string
): Pattern | undefined {
	if (!option || option === 'solid') {
		return undefined;
	}

	if (option === PATTERN_EDITOR_LINES_HORIZONTAL) {
		const merged = withPatternType(pattern, 'lines');
		const lines: LinesPattern =
			typeof merged === 'object' && merged.type === 'lines'
				? { ...(merged as LinesPattern) }
				: { type: 'lines' };

		lines.orientation = ['horizontal'];

		return collapsePatternSpec(lines);
	}

	if (option === 'lines') {
		const merged = withPatternType(pattern, 'lines');

		if (typeof merged === 'object' && merged.type === 'lines') {
			const lines: LinesPattern = { ...(merged as LinesPattern) };

			delete lines.orientation;

			return collapsePatternSpec(lines);
		}

		return merged ?? 'lines';
	}

	return withPatternType(pattern, option as HatchPatternType);
}

/**
 * Read custom hatch tile stroke width from a pattern spec.
 *
 * @param pattern Series pattern value.
 */
export function readPatternStrokeWidth(
	pattern: Pattern | null | undefined
): number | undefined {
	if (!isPatternSpecObject(pattern)) {
		return undefined;
	}

	const { strokeWidth } = pattern;

	if (strokeWidth === undefined || strokeWidth === '') {
		return undefined;
	}

	const parsed =
		typeof strokeWidth === 'number'
			? strokeWidth
			: parseFloat(String(strokeWidth));

	return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Set or clear the hatch type while keeping custom paint when the key still applies.
 *
 * @param pattern Current pattern value.
 * @param type    Next hatch type, or solid to clear.
 */
export function withPatternType(
	pattern: Pattern | null | undefined,
	type: 'solid' | HatchPatternType | ''
): Pattern | undefined {
	if (!type || type === 'solid') {
		return undefined;
	}

	if (isPatternSpecObject(pattern) && pattern.type === type) {
		return pattern;
	}

	const previousType = hatchTypeFromPattern(pattern);
	const nextKey = patternPrimaryPaintField(type);
	const previousKey =
		previousType === undefined
			? undefined
			: patternPrimaryPaintField(previousType);

	let paint: string | undefined;

	if (
		previousKey &&
		previousKey === nextKey &&
		isPatternSpecObject(pattern)
	) {
		paint = readPrimaryPaintFromSpec(pattern);
	}

	let next = specForType(pattern, type);

	if (paint !== undefined) {
		next = setPrimaryPaintOnSpec(next, type, paint);
	} else if (previousKey && previousKey !== nextKey) {
		next = setPrimaryPaintOnSpec(next, type, undefined);
	}

	if (
		previousType !== undefined &&
		previousType !== type &&
		!patternSupportsStrokeWidth(type)
	) {
		next = setStrokeWidthOnSpec(next, undefined);
	}

	return collapsePatternSpec(next);
}

/**
 * Set or clear hatch stroke/fill on the current pattern spec.
 *
 * @param pattern Current pattern value.
 * @param color   Hatch color, or undefined to clear.
 */
export function withPatternPrimaryPaint(
	pattern: Pattern | null | undefined,
	color: string | undefined
): Pattern | undefined {
	if (!isHatchingPattern(pattern)) {
		return pattern ?? undefined;
	}

	const type = hatchTypeFromPattern(pattern);

	if (!type) {
		return undefined;
	}

	const base = specForType(pattern, type);

	return collapsePatternSpec(setPrimaryPaintOnSpec(base, type, color));
}

/**
 * Set or clear hatch tile stroke width on the current pattern spec.
 *
 * @param pattern     Current pattern value.
 * @param strokeWidth Tile stroke width, or undefined to clear.
 */
export function withPatternStrokeWidth(
	pattern: Pattern | null | undefined,
	strokeWidth: number | undefined
): Pattern | undefined {
	if (!isHatchingPattern(pattern)) {
		return pattern ?? undefined;
	}

	const type = hatchTypeFromPattern(pattern);

	if (!type || !patternSupportsStrokeWidth(type)) {
		return pattern ?? undefined;
	}

	const base = specForType(pattern, type);

	return collapsePatternSpec(setStrokeWidthOnSpec(base, strokeWidth));
}
