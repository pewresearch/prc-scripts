import LoadingIndicator from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof LoadingIndicator> = {
	title: 'Components/LoadingIndicator',
	component: LoadingIndicator,
	args: {
		enabled: true,
		label: 'Loading…',
	},
};

export default meta;

type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {};

export const CustomLabel: Story = {
	args: {
		label: 'Fetching survey data…',
	},
};

export const Disabled: Story = {
	args: {
		enabled: false,
	},
};
