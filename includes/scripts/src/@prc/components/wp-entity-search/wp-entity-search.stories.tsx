/**
 * WPEntitySearch queries /prc-api/v3/components/wp-entity-search — served by
 * the fixture route table. Type a search term (e.g. "americans") to see
 * results; input is debounced 750ms.
 */
import { useState } from 'react';

import WPEntitySearch from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof WPEntitySearch> = {
	title: 'Components/WPEntitySearch',
	component: WPEntitySearch,
};

export default meta;

type Story = StoryObj<typeof WPEntitySearch>;

function WPEntitySearchDemo(props: Record<string, unknown>) {
	const [selected, setSelected] = useState<unknown>(null);
	return (
		<div style={{ maxWidth: 480 }}>
			<WPEntitySearch
				placeholder="Artificial Intelligence"
				searchValue="americans"
				entityType="postType"
				entitySubType={['post']}
				onSelect={setSelected}
				{...props}
			/>
			{Boolean(selected) && (
				<pre>{JSON.stringify(selected, null, 2)}</pre>
			)}
		</div>
	);
}

export const Default: Story = {
	render: () => <WPEntitySearchDemo />,
};

export const WithExcerptAndImage: Story = {
	render: () => (
		<WPEntitySearchDemo showExcerpt showFeaturedImage searchSize="large" />
	),
};
