import { SocialImageGenerator } from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof SocialImageGenerator> = {
	title: 'Components/SocialImageGenerator',
	component: SocialImageGenerator,
	args: {
		platformType: 'instagram',
		title: 'How Americans View Artificial Intelligence',
		sourceImageUrl: 'https://placehold.co/1200x1200/png',
	},
	argTypes: {
		platformType: {
			control: 'select',
			options: ['instagram', 'facebook', 'twitter', 'linkedin'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof SocialImageGenerator>;

export const Default: Story = {
	render: (args) => (
		<div style={{ maxWidth: 720 }}>
			<SocialImageGenerator
				{...args}
				onGenerate={(file: unknown) => {
					// eslint-disable-next-line no-console
					console.log('Generated social image file:', file);
				}}
			/>
		</div>
	),
};

export const WithoutSourceImage: Story = {
	render: (args) => (
		<div style={{ maxWidth: 720 }}>
			<SocialImageGenerator
				{...args}
				sourceImageUrl={null}
				onGenerate={() => {}}
			/>
		</div>
	),
};
