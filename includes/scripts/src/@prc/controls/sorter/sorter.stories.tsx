import { useState } from 'react';

import Sorter from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

interface SorterOption {
	label: string;
	value: string;
	isActive?: boolean;
	disabled?: boolean;
}

const DEFAULT_OPTIONS: SorterOption[] = [
	{ label: 'Strongly agree', value: 'strongly-agree' },
	{ label: 'Somewhat agree', value: 'somewhat-agree' },
	{ label: 'Somewhat disagree', value: 'somewhat-disagree' },
	{ label: 'Strongly disagree', value: 'strongly-disagree' },
];

const meta: Meta<typeof Sorter> = {
	title: 'Controls/Sorter',
	component: Sorter,
};

export default meta;

type Story = StoryObj<typeof Sorter>;

function SorterDemo({
	canEdit = true,
	isRemovable = true,
	hasSetActive = false,
}: {
	canEdit?: boolean;
	isRemovable?: boolean;
	hasSetActive?: boolean;
}) {
	const [options, setOptions] = useState<SorterOption[]>(DEFAULT_OPTIONS);
	return (
		<div style={{ maxWidth: 320 }}>
			<Sorter
				options={options}
				onChange={(newItems: SorterOption[]) => setOptions(newItems)}
				canEdit={canEdit}
				isRemovable={isRemovable}
				hasSetActive={hasSetActive}
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <SorterDemo />,
};

export const ReadOnly: Story = {
	render: () => <SorterDemo canEdit={false} isRemovable={false} />,
};

export const WithSetActive: Story = {
	render: () => <SorterDemo hasSetActive />,
};
