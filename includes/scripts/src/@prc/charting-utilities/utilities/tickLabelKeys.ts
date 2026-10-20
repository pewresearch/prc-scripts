/**
 * Tick label customizations are stored per axis as `{ [key]: entry }`, where
 * `entry` is a style object (`{ text?, fill?, fontSize?, offsetX?, offsetY?, … }`)
 * or, for older charts, a plain string holding the replacement text.
 *
 * Single-plot charts key an entry by the tick value alone. Small multiples
 * repeat the same tick values in every panel, so an entry the author made in
 * one panel is scoped with the panel key — `2024::Germany` — the same way
 * `generateElementKey` scopes a data label by its group value.
 */

export type TickLabelEntry = string | Record<string, any>;
export type TickLabelEntries = Record<string, TickLabelEntry>;

/**
 * Build the storage key for a tick customization.
 *
 * @param tickValue Raw tick value.
 * @param panelKey  Small-multiples panel the entry belongs to, if any.
 * @return Storage key.
 */
export function generateTickLabelKey(
	tickValue: unknown,
	panelKey?: string | null
): string {
	const tick =
		tickValue instanceof Date ? tickValue.toISOString() : String(tickValue);
	return panelKey ? `${tick}::${panelKey}` : tick;
}

/**
 * Read the customization that applies to a tick.
 *
 * Inside a panel, a panel-scoped entry layers over any chart-wide entry for
 * the same tick, so a shared restyle still reaches panels that only override
 * the text. Panels without their own entry fall back to the chart-wide one.
 *
 * @param entries   Stored customizations for one axis.
 * @param tickValue Raw tick value.
 * @param panelKey  Small-multiples panel being drawn, if any.
 * @return The entry to apply, or undefined when the tick is uncustomized.
 */
export function resolveTickLabelEntry(
	entries: TickLabelEntries | undefined,
	tickValue: unknown,
	panelKey?: string | null
): TickLabelEntry | undefined {
	if (!entries) {
		return undefined;
	}

	const shared = entries[generateTickLabelKey(tickValue)];
	if (!panelKey) {
		return shared;
	}

	const scoped = entries[generateTickLabelKey(tickValue, panelKey)];
	if (scoped === undefined) {
		return shared;
	}
	if (
		typeof scoped === 'string' ||
		typeof shared !== 'object' ||
		shared === null
	) {
		return scoped;
	}
	return { ...shared, ...(scoped as Record<string, any>) };
}
