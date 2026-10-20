import type { CategoryStyle } from '../types/colors';
import type { Pattern, PatternSpec } from '../types/pattern';

/**
 * SVG `<pattern>` id for a category hatch.
 *
 * Category names are human-readable labels. A raw label with a space or
 * punctuation makes `url(#...)` unresolvable, so the mark paints nothing.
 *
 * @param category Color-domain key.
 */
export function seriesPatternId(category: string): string {
	return `series-pattern-${patternSlug(category)}`;
}

/**
 * SVG `<pattern>` id for a legend swatch hatch.
 *
 * A legend swatch is its own inline SVG, so it cannot reach the chart's
 * defs. It repeats the same spec under its own id.
 *
 * @param category Color-domain key.
 */
export function legendPatternId(category: string): string {
	return `legend-pattern-${patternSlug(category)}`;
}

function patternSlug(category: string): string {
	return category
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Whether a series pattern paints a hatch def instead of a solid fill.
 *
 * @param pattern Series pattern value.
 */
export function isHatchingPattern(
	pattern: Pattern | null | undefined
): pattern is Exclude<Pattern, 'solid'> {
	if (pattern == null || pattern === 'solid') {
		return false;
	}

	return true;
}

/**
 * Expand a string preset into a visx spec, or return the object as-is.
 *
 * @param pattern Series pattern value.
 */
export function resolvePatternSpec(
	pattern: Pattern | null | undefined
): PatternSpec | null {
	if (!isHatchingPattern(pattern)) {
		return null;
	}

	if (typeof pattern === 'string') {
		return { type: pattern };
	}

	return pattern;
}

/**
 * SVG fill for a mark after series pattern is applied.
 *
 * A non-solid `pattern` paints through a `<defs>` hatch. The identity
 * color stays on `style.fill` so the hatch can stroke with it.
 *
 * @param style    Resolved paint for the mark.
 * @param category Color-domain key.
 */
export function resolvePatternFill(
	style: CategoryStyle | null | undefined,
	category: string
): string | undefined {
	if (!isHatchingPattern(style?.pattern)) {
		return style?.fill;
	}

	return `url(#${seriesPatternId(category)})`;
}
