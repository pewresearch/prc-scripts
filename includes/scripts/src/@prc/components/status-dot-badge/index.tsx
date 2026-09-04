import type { ReactElement } from 'react';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { Icon } from '@wordpress/icons';

export const STATUS_DOT_COLORS = {
	success: '#1a8a1a',
	warning: '#c07800',
	error: '#cc1818',
	neutral: '#757575',
} as const;

export type StatusDotTone = keyof typeof STATUS_DOT_COLORS;

export interface StatusDotBadgeProps {
	label: string;
	color: string;
	className?: string;
	icon?: ReactElement;
}

function StatusDotBadgeIndicator({
	icon,
	color,
}: {
	icon?: ReactElement;
	color: string;
}) {
	if (icon) {
		return (
			<span aria-hidden="true" style={{ display: 'inline-flex' }}>
				<Icon
					icon={icon}
					size={16}
					style={{ color, fill: 'currentColor', flexShrink: 0 }}
				/>
			</span>
		);
	}

	return (
		<span
			aria-hidden="true"
			className="prc-status-dot-badge__dot"
			style={{
				display: 'inline-block',
				width: 8,
				height: 8,
				borderRadius: '50%',
				background: color,
				flexShrink: 0,
			}}
		/>
	);
}

export default function StatusDotBadge({
	label,
	color,
	className,
	icon,
}: StatusDotBadgeProps) {
	return (
		<HStack
			spacing={1}
			className={className}
			style={{ display: 'inline-flex', width: 'auto' }}
		>
			<StatusDotBadgeIndicator icon={icon} color={color} />
			<Text size={12} style={{ color }}>
				{label}
			</Text>
		</HStack>
	);
}
