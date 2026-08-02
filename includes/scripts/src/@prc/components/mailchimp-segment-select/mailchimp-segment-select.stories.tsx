/**
 * Loads audiences + segments from prc-email-builder REST (fixture-backed).
 */
import { useState } from 'react';

import MailchimpSegmentSelect from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MailchimpSegmentSelect> = {
	title: 'Components/MailchimpSegmentSelect',
	component: MailchimpSegmentSelect,
};

export default meta;

type Story = StoryObj<typeof MailchimpSegmentSelect>;

function SegmentSelectDemo() {
	const [audienceId, setAudienceId] = useState('');
	const [segmentId, setSegmentId] = useState('');
	return (
		<div style={{ maxWidth: 360 }}>
			<MailchimpSegmentSelect
				audienceId={audienceId}
				segmentId={segmentId}
				onAudienceChange={setAudienceId}
				onSegmentChange={setSegmentId}
			/>
			<p>
				Audience: <code>{audienceId || '(none)'}</code>
			</p>
			<p>
				Segment: <code>{segmentId || '(entire audience)'}</code>
			</p>
		</div>
	);
}

export const Default: Story = {
	render: () => <SegmentSelectDemo />,
};
