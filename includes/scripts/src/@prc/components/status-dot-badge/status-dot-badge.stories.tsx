import { published } from '@wordpress/icons';

import StatusDotBadge, { STATUS_DOT_COLORS } from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof StatusDotBadge> = {
	title: 'Components/StatusDotBadge',
	component: StatusDotBadge,
	args: {
		label: 'Published',
		color: STATUS_DOT_COLORS.success,
	},
};

export default meta;

type Story = StoryObj<typeof StatusDotBadge>;

export const Success: Story = {};

export const Warning: Story = {
	args: {
		label: 'No Campaign',
		color: STATUS_DOT_COLORS.warning,
	},
};

export const Error: Story = {
	args: {
		label: 'Failed',
		color: STATUS_DOT_COLORS.error,
	},
};

export const Neutral: Story = {
	args: {
		label: 'Draft',
		color: STATUS_DOT_COLORS.neutral,
	},
};

export const WithIcon: Story = {
	args: {
		label: 'Published',
		color: STATUS_DOT_COLORS.success,
		icon: published,
	},
};
