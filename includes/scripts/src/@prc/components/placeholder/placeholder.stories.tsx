import Placeholder from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof Placeholder> = {
	title: 'Components/Placeholder',
	component: Placeholder,
	argTypes: {
		type: {
			control: 'radio',
			options: ['paragraph', 'image', 'header'],
		},
	},
	args: {
		type: 'paragraph',
	},
	decorators: [
		(Story) => (
			<div>
				{/* The component ships class hooks but no styles of its own;
				    give the skeleton lines minimal dimensions so they render. */}
				<style>{`
					.placeholder [class*='__line'] {
						background: #e0e0e0;
						border-radius: 4px;
						height: 14px;
						margin-bottom: 8px;
						max-width: 480px;
					}
					.placeholder__image__line { height: 180px; }
					.placeholder__header__line { height: 24px; max-width: 320px; }
				`}</style>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Placeholder>;

export const Paragraph: Story = {};

export const Image: Story = {
	args: { type: 'image' },
};

export const Header: Story = {
	args: { type: 'header' },
};
