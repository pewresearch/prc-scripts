/**
 * Loads audiences + segments from prc-email-builder REST (fixture-backed).
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
	const [audienceId, setAudienceId] = useState('aud-main');
	const [selected, setSelected] = useState<string[]>(['101']);
	return (
		<div style={{ maxWidth: 360 }}>
			<MailchimpSegmentList
				audienceId={audienceId}
				onAudienceChange={setAudienceId}
				segmentIds={selected}
				onUpdate={(next: string[]) => setSelected(next)}
			/>
			<pre>{JSON.stringify({ audienceId, selected }, null, 2)}</pre>
		</div>
	);
}

export const Default: Story = {
	render: () => <SegmentListDemo />,
};
