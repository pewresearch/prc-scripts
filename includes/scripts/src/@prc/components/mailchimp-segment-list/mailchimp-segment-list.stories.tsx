/**
 * Loads segments from /prc-api/v3/mailchimp/get-segments (fixture-backed).
 */
import { useState } from 'react';

import MailchimpSegmentList from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MailchimpSegmentList> = {
	title: 'Components/MailchimpSegmentList',
	component: MailchimpSegmentList,
};

export default meta;

type Story = StoryObj<typeof MailchimpSegmentList>;

function SegmentListDemo() {
	const [selected, setSelected] = useState<string[]>(['int-weekly-roundup']);
	return (
		<div style={{ maxWidth: 360 }}>
			<MailchimpSegmentList
				interests={selected}
				onUpdate={(next: string[]) => setSelected(next)}
			/>
			<pre>{JSON.stringify(selected, null, 2)}</pre>
		</div>
	);
}

export const Default: Story = {
	render: () => <SegmentListDemo />,
};
