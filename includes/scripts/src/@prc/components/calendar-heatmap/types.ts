import type { ReactNode } from 'react';

export type HeatLevel = 'none' | 'low' | 'medium' | 'high' | 'very-high';

export const MONTH_LABELS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
] as const;

export type CalendarHeatmapProps = {
	values: number[];
	labels?: string[];
	renderValue?: (value: number, index: number) => ReactNode;
	getTooltipText?: (value: number, index: number) => string | undefined;
	highlightIndex?: number | null;
	className?: string;
};

export type AnalyticsPeriodControlsProps = {
	years: Array<string | number>;
	selectedYear: string | number;
	onYearChange: (year: string) => void;
	selectedMonth: string;
	onMonthChange: (month: string) => void;
	yearLabel?: string;
	monthLabel?: string;
	allMonthsLabel?: string;
};

/**
 * Map a value onto a heat bucket relative to the series max.
 *
 * @param value  Cell value.
 * @param values Full series used for scaling.
 */
export function getHeatLevel(value: number, values: number[]): HeatLevel {
	const max = Math.max(...values, 0);
	const percentage = max > 0 ? (value / max) * 100 : 0;
	if (value === 0) {
		return 'none';
	}
	if (percentage <= 25) {
		return 'low';
	}
	if (percentage <= 50) {
		return 'medium';
	}
	if (percentage <= 75) {
		return 'high';
	}
	return 'very-high';
}
