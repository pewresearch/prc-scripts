/**
 * Read-only social previews (Tier A). The editable variants (RichText /
 * MediaUpload backed) live in social-preview-editable.stories.tsx under the
 * block editor decorator.
 */
import {
	SocialPreview,
	GooglePreview,
	SlackPreview,
	LinkedInPreview,
	DiscordPreview,
	TeamsPreview,
	InstagramPostPreview,
} from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const SHARED_ARGS = {
	title: 'How Americans View Artificial Intelligence',
	description:
		'A majority of U.S. adults say they interact with AI several times a day, but views on its societal impact remain mixed.',
	url: 'https://www.pewresearch.org/internet/2026/05/12/how-americans-view-artificial-intelligence/',
	image: 'https://placehold.co/1200x630/png',
	siteName: 'Pew Research Center',
	favicon: 'https://www.pewresearch.org/favicon.ico',
};

const meta: Meta<typeof SocialPreview> = {
	title: 'Components/SocialPreview',
	component: SocialPreview,
	args: SHARED_ARGS,
};

export default meta;

type Story = StoryObj<typeof SocialPreview>;

export const MultiNetwork: Story = {
	args: {
		networks: ['google', 'slack', 'linkedin'],
	},
};

export const Google: Story = {
	render: (args) => <GooglePreview {...args} />,
};

export const Slack: Story = {
	render: (args) => (
		<SlackPreview
			{...args}
			displayName="Seth Rubenstein"
			messageText="Sharing our new AI report:"
			timestamp="1:36 PM"
			readingTime="3 minutes"
			author="Shanay Gracia"
		/>
	),
};

export const LinkedIn: Story = {
	render: (args) => (
		<LinkedInPreview
			{...args}
			displayName="Pew Research Center"
			followers="166,244 followers"
			postText="Most Americans now encounter AI in daily life. Here is what they think about it."
			timestamp="6h"
			reactions={128}
			comments={12}
			reposts={34}
		/>
	),
};

export const Discord: Story = {
	render: (args) => <DiscordPreview {...args} />,
};

export const Teams: Story = {
	render: (args) => <TeamsPreview {...args} />,
};

export const InstagramPost: Story = {
	render: (args) => (
		<InstagramPostPreview
			{...args}
			username="pewresearch"
			likes={1204}
			comments={56}
		/>
	),
};
