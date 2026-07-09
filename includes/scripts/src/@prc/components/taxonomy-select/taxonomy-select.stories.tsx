/**
 * TaxonomySelect reads taxonomy configs from the real @wordpress/core-data
 * store (`getEntitiesConfig('taxonomy')`), hydrated from the /wp/v2/taxonomies
 * fixture route.
 */
import { useState } from 'react';

import TaxonomySelect from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof TaxonomySelect> = {
	title: 'Components/TaxonomySelect',
	component: TaxonomySelect,
};

export default meta;

type Story = StoryObj<typeof TaxonomySelect>;

function TaxonomySelectDemo({ allowMultiple }: { allowMultiple?: boolean }) {
	const [value, setValue] = useState<unknown>(
		allowMultiple ? [] : 'category'
	);
	return (
		<div style={{ maxWidth: 360 }}>
			<TaxonomySelect
				value={value}
				onChange={setValue}
				allowMultiple={allowMultiple}
			/>
			<pre>{JSON.stringify(value, null, 2)}</pre>
		</div>
	);
}

export const Default: Story = {
	render: () => <TaxonomySelectDemo />,
};

export const MultiSelect: Story = {
	render: () => <TaxonomySelectDemo allowMultiple />,
};
