import { useState } from 'react';

import MarkedRangeControl from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MarkedRangeControl> = {
	title: 'Components/MarkedRangeControl',
	component: MarkedRangeControl,
};

export default meta;

type Story = StoryObj<typeof MarkedRangeControl>;

function ControlledDemo(props: Record<string, unknown>) {
	const [value, setValue] = useState(50);
	return (
		<div style={{ maxWidth: 320 }}>
			<MarkedRangeControl
				label="Column width (%)"
				value={value}
				onChange={setValue}
				min={0}
				max={100}
				step={25}
				marks={[
					{ value: 0, label: '0%' },
					{ value: 25, label: '25%' },
					{ value: 50, label: '50%' },
					{ value: 75, label: '75%' },
					{ value: 100, label: '100%' },
				]}
				withInputField={false}
				{...props}
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <ControlledDemo />,
};

export const WithInputField: Story = {
	render: () => <ControlledDemo withInputField />,
};
