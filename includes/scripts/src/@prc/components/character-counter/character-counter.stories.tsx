import CharacterCounter from './index';
import CharacterCounterRing from './ring';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof CharacterCounter> = {
	title: 'Components/CharacterCounter',
	component: CharacterCounter,
	args: {
		current: 42,
		limit: 280,
	},
};

export default meta;

type Story = StoryObj<typeof CharacterCounter>;

export const Default: Story = {};

export const NearLimit: Story = {
	args: { current: 250, limit: 280 },
};

export const OverLimit: Story = {
	args: { current: 300, limit: 280 },
};

export const Ring: StoryObj<typeof CharacterCounterRing> = {
	render: (args) => <CharacterCounterRing {...args} />,
	args: { current: 42, limit: 280, size: 32 },
};

export const RingNearLimit: StoryObj<typeof CharacterCounterRing> = {
	render: (args) => <CharacterCounterRing {...args} />,
	args: { current: 265, limit: 280, size: 32 },
};

export const RingOverLimit: StoryObj<typeof CharacterCounterRing> = {
	render: (args) => <CharacterCounterRing {...args} />,
	args: { current: 310, limit: 280, size: 32 },
};
