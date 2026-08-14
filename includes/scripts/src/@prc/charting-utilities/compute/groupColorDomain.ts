type GroupColorRow = Record<string, unknown>;

export interface GetGroupColorDomainOptions {
	groupOrder?: Array<string | number> | null;
	legendCategories?: string[] | null;
}

function collectFirstSeenGroupValues(
	data: GroupColorRow[] | null | undefined,
	groupKey: string
): string[] {
	const seen = new Set<string>();
	const values: string[] = [];
	if (!Array.isArray(data)) {
		return values;
	}
	for (const row of data) {
		const raw = row?.[groupKey];
		if (raw === null || raw === undefined || raw === '') {
			continue;
		}
		const value = String(raw);
		if (!seen.has(value)) {
			seen.add(value);
			values.push(value);
		}
	}
	return values;
}

function sameStringSet(left: string[], right: string[]): boolean {
	if (left.length !== right.length) {
		return false;
	}
	const sortedLeft = [...left].sort();
	const sortedRight = [...right].sort();
	return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function applyGroupOrder(
	values: string[],
	groupOrder?: Array<string | number> | null
): string[] {
	if (!Array.isArray(groupOrder) || groupOrder.length === 0) {
		return values;
	}
	const seen = new Set(values);
	const ordered = groupOrder.map(String).filter((key) => seen.has(key));
	const rest = values.filter((key) => !ordered.includes(key));
	return [...ordered, ...rest];
}

/**
 * Color-scale domain for point charts grouped by a column.
 *
 * Palette chips pair with these labels by index, so the domain must follow
 * editor order (group sorter, then legend) rather than alphabetical sort.
 *
 * @param data     Chart rows.
 * @param groupKey Column that holds group names.
 * @param options  Optional group sorter and legend order.
 * @return Group names in palette order.
 */
export function getGroupColorDomain(
	data: GroupColorRow[] | null | undefined,
	groupKey: string | null | undefined,
	options: GetGroupColorDomainOptions = {}
): string[] {
	if (!groupKey) {
		return [];
	}

	const firstSeen = collectFirstSeenGroupValues(data, groupKey);
	if (firstSeen.length === 0) {
		return [];
	}

	const ordered = applyGroupOrder(firstSeen, options.groupOrder);
	const legendCategories = Array.isArray(options.legendCategories)
		? options.legendCategories.map(String).filter(Boolean)
		: [];

	if (
		legendCategories.length > 0 &&
		sameStringSet(legendCategories, ordered)
	) {
		return legendCategories;
	}

	return ordered;
}
