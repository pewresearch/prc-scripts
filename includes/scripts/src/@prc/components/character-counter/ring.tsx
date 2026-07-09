export interface CharacterCounterRingProps {
	current: number;
	limit: number;
	size?: number;
}

const COLORS = {
	track: '#E5E7EB',
	normal: '#22C55E',
	warning: '#F59E0B',
	over: '#EF4444',
	label: '#6B7280',
} as const;

function getRingState(current: number, limit: number) {
	if (limit <= 0) {
		return {
			color: COLORS.normal,
			label: '0%',
			fillRatio: 0,
			labelColor: COLORS.label,
		};
	}

	const remaining = limit - current;
	const ratio = current / limit;

	if (remaining < 0) {
		return {
			color: COLORS.over,
			label: `${remaining}`,
			fillRatio: 1,
			labelColor: COLORS.over,
		};
	}

	if (remaining <= 20) {
		return {
			color: COLORS.warning,
			label: `${remaining}`,
			fillRatio: Math.min(ratio, 1),
			labelColor: COLORS.warning,
		};
	}

	return {
		color: COLORS.normal,
		label: `${Math.round(ratio * 100)}%`,
		fillRatio: Math.min(ratio, 1),
		labelColor: COLORS.label,
	};
}

export default function CharacterCounterRing({
	current,
	limit,
	size = 20,
}: CharacterCounterRingProps) {
	const strokeWidth = 2;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const { color, label, fillRatio, labelColor } = getRingState(
		current,
		limit
	);
	const dashOffset = circumference * (1 - fillRatio);

	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				fontSize: 13,
				fontVariantNumeric: 'tabular-nums',
				lineHeight: 1,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				aria-hidden="true"
				style={{ flexShrink: 0 }}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={COLORS.track}
					strokeWidth={strokeWidth}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</svg>
			<span style={{ color: labelColor }}>{label}</span>
		</span>
	);
}
