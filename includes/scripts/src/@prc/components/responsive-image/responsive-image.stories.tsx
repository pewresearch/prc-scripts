import ResponsiveImage from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof ResponsiveImage> = {
	title: 'Components/ResponsiveImage',
	component: ResponsiveImage,
	args: {
		alt: 'Fixture chart artwork',
		src: 'https://placehold.co/640x360/png',
	},
};

export default meta;

type Story = StoryObj<typeof ResponsiveImage>;

export const Default: Story = {};

export const WithSources: Story = {
	args: {
		sources: [
			{
				srcSet: 'https://placehold.co/1200x675/png',
				media: '(min-width: 900px)',
			},
			{
				srcSet: 'https://placehold.co/600x338/png',
				media: '(min-width: 400px)',
			},
		],
		sizes: '(min-width: 900px) 1200px, 100vw',
	},
};
