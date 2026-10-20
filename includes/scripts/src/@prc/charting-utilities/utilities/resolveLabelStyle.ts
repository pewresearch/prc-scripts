import type { LabelStyleOverride } from '../types/labels';

export interface ResolveLabelStyleArgs {
	defaults?: LabelStyleOverride | null;
	series?: LabelStyleOverride | null;
	custom?: LabelStyleOverride | null;
}

function definedFields(
	style: LabelStyleOverride | null | undefined
): LabelStyleOverride {
	return Object.fromEntries(
		Object.entries(style ?? {}).filter(([, value]) => value !== undefined)
	) as LabelStyleOverride;
}

/**
 * Resolve value-label typography from chart defaults, series style, and the
 * per-mark popover.
 *
 * Chart → series → mark, the same order as `resolvePaint`. Nested on
 * `CategoryStyle.label` so these keys never collide with fill/stroke.
 *
 * @param defaults Chart `labels.*` mapped onto the override shape, plus the
 *                 already-resolved fill when the caller has one.
 * @param series   `seriesStyles[category].label`.
 * @param custom   `__labelStyles[category]` from the mark popover.
 */
export function resolveLabelStyle({
	defaults,
	series,
	custom,
}: ResolveLabelStyleArgs): LabelStyleOverride {
	return {
		...definedFields(defaults),
		...definedFields(series),
		...definedFields(custom),
	};
}
