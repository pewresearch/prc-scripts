/**
 * Loads segments from /prc-api/v3/mailchimp/get-segments (fixture-backed).
 */
import { useState } from 'react';

import { Toolbar } from '@wordpress/components';

import MailchimpSegmentSelect from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MailchimpSegmentSelect> = {
	title: 'Components/MailchimpSegmentSelect',
	component: MailchimpSegmentSelect,
};

export default meta;

type Story = StoryObj<typeof MailchimpSegmentSelect>;

function SegmentSelectDemo({ renderAs }: { renderAs?: 'select' | 'toolbar' }) {
	const [value, setValue] = useState<string | undefined>(undefined);
	const control = (
		<MailchimpSegmentSelect
			value={value}
			onChange={setValue}
			renderAs={renderAs}
		/>
	);
	return (
		<div style={{ maxWidth: 360 }}>
			{renderAs === 'toolbar' ? (
				<Toolbar label="Mailchimp segment">{control}</Toolbar>
			) : (
				control
			)}
			<p>
				Selected: <code>{value ?? '(none)'}</code>
			</p>
		</div>
	);
}

export const Select: Story = {
	render: () => <SegmentSelectDemo renderAs="select" />,
};

export const ToolbarVariant: Story = {
	render: () => <SegmentSelectDemo renderAs="toolbar" />,
};
