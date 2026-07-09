import { DesktopSafariChrome, MobileSafariChrome } from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof DesktopSafariChrome> = {
	title: 'Components/BrowserChrome',
	component: DesktopSafariChrome,
	args: {
		url: 'https://www.pewresearch.org',
	},
};

export default meta;

type Story = StoryObj<typeof DesktopSafariChrome>;

const sampleContent = (
	<div style={{ padding: '2em', fontFamily: 'Georgia, serif' }}>
		<h1>How Americans View Artificial Intelligence</h1>
		<p>
			A majority of U.S. adults say they interact with AI several times a
			day, but views on its societal impact remain mixed.
		</p>
	</div>
);

export const DesktopSafari: Story = {
	render: (args) => (
		<DesktopSafariChrome {...args}>{sampleContent}</DesktopSafariChrome>
	),
};

export const MobileSafari: Story = {
	render: (args) => (
		<div style={{ maxWidth: 390 }}>
			<MobileSafariChrome {...args}>{sampleContent}</MobileSafariChrome>
		</div>
	),
};

export const MobileSafariNoUrlBar: Story = {
	render: (args) => (
		<div style={{ maxWidth: 390 }}>
			<MobileSafariChrome {...args} showUrlBar={false}>
				{sampleContent}
			</MobileSafariChrome>
		</div>
	),
};
