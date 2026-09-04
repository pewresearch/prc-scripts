import type { DataRender } from '../types/dataRender';

export function canonicalRowValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}
	if (value instanceof Date) {
		const year = value.getUTCFullYear();
		const month = String(value.getUTCMonth() + 1).padStart(2, '0');
		const day = String(value.getUTCDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	return String(value).trim();
}

function rowSurvives(
	row: unknown,
	column: string,
	excludeSet: Set<string>
): boolean {
	if (row === null || typeof row !== 'object') {
		return true;
	}
	return !excludeSet.has(
		canonicalRowValue((row as Record<string, unknown>)[column])
	);
}

export function selectPlotRows<T>(
	data: T,
	dataRender: Pick<DataRender, 'x' | 'rowFilter'> | null | undefined
): T {
	const exclude = dataRender?.rowFilter?.exclude;
	if (!exclude || exclude.length === 0) {
		return data;
	}
	if (!Array.isArray(data)) {
		return data;
	}

	const column = dataRender?.rowFilter?.column || dataRender?.x || 'x';
	const excludeSet = new Set(exclude.map(canonicalRowValue));

	if (0 < data.length && Array.isArray(data[0])) {
		return data.map((inner) => {
			if (!Array.isArray(inner)) {
				return inner;
			}
			return inner.filter((row) => rowSurvives(row, column, excludeSet));
		}) as T;
	}

	return data.filter((row) => rowSurvives(row, column, excludeSet)) as T;
}
