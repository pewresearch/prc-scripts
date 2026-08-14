import styled from '@emotion/styled';
import { Tooltip } from '@wordpress/components';
import type { CalendarHeatmapProps, HeatLevel } from './types';
import { MONTH_LABELS, getHeatLevel } from './types';

const HEAT_STYLES: Record<
	HeatLevel,
	{ background: string; border: string; color: string }
> = {
	none: {
		background: '#fff',
		border: 'var(--wp-admin-theme-color-lighter-70, #c5d9ed)',
		color: 'var(--wp-admin-theme-color-darker-10, #006ba1)',
	},
	low: {
		background: '#ffffb2',
		border: 'rgba(0, 0, 0, 0.1)',
		color: '#666',
	},
	medium: {
		background: '#fed976',
		border: 'rgba(0, 0, 0, 0.1)',
		color: '#444',
	},
	high: {
		background: '#fd8d3c',
		border: 'rgba(0, 0, 0, 0.1)',
		color: '#fff',
	},
	'very-high': {
		background: '#e31a1c',
		border: 'rgba(0, 0, 0, 0.1)',
		color: '#fff',
	},
};

const HeatmapGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1rem;
	max-width: 100%;

	@media (max-width: 600px) {
		grid-template-columns: repeat(2, 1fr);
	}
`;

const HeatmapCell = styled.div<{ $heat: HeatLevel; $highlight?: boolean }>`
	position: relative;
	background: ${(props) => HEAT_STYLES[props.$heat].background};
	border: 1px solid ${(props) => HEAT_STYLES[props.$heat].border};
	border-radius: 4px;
	padding: 0.75rem;
	text-align: center;
	min-height: 70px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	transition: all 0.2s ease;
	color: ${(props) => HEAT_STYLES[props.$heat].color};
	outline: ${(props) =>
		props.$highlight
			? '2px solid var(--wp-admin-theme-color, #007cba)'
			: 'none'};
	outline-offset: ${(props) => (props.$highlight ? '2px' : '0')};

	&::before {
		content: attr(data-month);
		position: absolute;
		top: 0.25rem;
		left: 0.5rem;
		font-size: 0.75rem;
		opacity: 0.8;
		color: ${(props) =>
			props.$heat === 'none'
				? 'var(--wp-admin-theme-color, #007cba)'
				: HEAT_STYLES[props.$heat].color};
	}

	&:hover {
		background: ${(props) =>
			props.$heat === 'none'
				? 'var(--wp-admin-theme-color-lighter-80, #e5f0f8)'
				: HEAT_STYLES[props.$heat].background};
	}
`;

const HeatmapValue = styled.span<{ $heat: HeatLevel }>`
	font-size: 1.25rem;
	font-weight: 600;
	color: ${(props) =>
		props.$heat === 'none'
			? 'var(--wp-admin-theme-color-darker-10, #006ba1)'
			: HEAT_STYLES[props.$heat].color};
`;

export default function CalendarHeatmap({
	values,
	labels = [...MONTH_LABELS],
	renderValue,
	getTooltipText,
	highlightIndex = null,
	className,
}: CalendarHeatmapProps) {
	return (
		<HeatmapGrid className={className}>
			{values.map((value, index) => {
				const heat = getHeatLevel(value, values);
				const label = labels[index] || String(index);
				const display = renderValue ? renderValue(value, index) : value;
				const tooltip = getTooltipText?.(value, index);
				const content = (
					<HeatmapValue $heat={heat}>{display}</HeatmapValue>
				);

				return (
					<HeatmapCell
						key={label}
						data-month={label}
						data-heat={heat}
						$heat={heat}
						$highlight={highlightIndex === index}
					>
						{tooltip ? (
							<Tooltip text={tooltip}>
								<span tabIndex={0}>{content}</span>
							</Tooltip>
						) : (
							content
						)}
					</HeatmapCell>
				);
			})}
		</HeatmapGrid>
	);
}

export type {
	CalendarHeatmapProps,
	HeatLevel,
	AnalyticsPeriodControlsProps,
} from './types';
export { MONTH_LABELS, getHeatLevel } from './types';
