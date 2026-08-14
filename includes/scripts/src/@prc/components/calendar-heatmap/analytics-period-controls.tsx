import {
	SelectControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { MONTH_LABELS } from './types';
import type { AnalyticsPeriodControlsProps } from './types';

export default function AnalyticsPeriodControls({
	years,
	selectedYear,
	onYearChange,
	selectedMonth,
	onMonthChange,
	yearLabel = __('Select Year', 'prc-components'),
	monthLabel = __('Select Month', 'prc-components'),
	allMonthsLabel = __('All months', 'prc-components'),
}: AnalyticsPeriodControlsProps) {
	const monthOptions = [
		{ label: allMonthsLabel, value: '' },
		...MONTH_LABELS.map((label, index) => ({
			label,
			value: String(index + 1).padStart(2, '0'),
		})),
	];

	return (
		<VStack spacing={3}>
			<SelectControl
				label={yearLabel}
				value={String(selectedYear)}
				options={years.map((year) => ({
					label: String(year),
					value: String(year),
				}))}
				onChange={(value) => {
					onMonthChange('');
					onYearChange(value);
				}}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			<SelectControl
				label={monthLabel}
				value={selectedMonth}
				options={monthOptions}
				onChange={onMonthChange}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</VStack>
	);
}
