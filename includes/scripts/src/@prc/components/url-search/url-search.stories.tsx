/**
 * URLSearchField searches posts through @wordpress/core-data and resolves
 * pasted URLs via /prc-api/v3/utils/postid-by-url; both are fixture-backed.
 * Try typing "democracy" or pasting any https:// URL.
 */
import { useState } from 'react';

import { URLSearchField, URLSearchToolbar } from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof URLSearchField> = {
	title: 'Components/URLSearch',
	component: URLSearchField,
};

export default meta;

type Story = StoryObj<typeof URLSearchField>;

function URLSearchDemo({ toolbar }: { toolbar?: boolean }) {
	const [selected, setSelected] = useState<unknown>(null);
	const Component = toolbar ? URLSearchToolbar : URLSearchField;
	return (
		<div style={{ maxWidth: 480 }}>
			<Component postId={999} postType="post" onSelect={setSelected} />
			{Boolean(selected) && (
				<pre>
					{JSON.stringify(
						(selected as { title?: unknown })?.title ?? selected,
						null,
						2
					)}
				</pre>
			)}
		</div>
	);
}

export const Field: Story = {
	render: () => <URLSearchDemo />,
};

export const Toolbar: Story = {
	render: () => <URLSearchDemo toolbar />,
};
