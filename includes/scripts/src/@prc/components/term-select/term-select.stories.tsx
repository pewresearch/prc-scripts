/**
 * TermSelect resolves terms through the real @wordpress/core-data entity
 * store; requests hit the fixture-backed apiFetch handler in
 * .storybook/mocks/api-fetch-handlers.ts.
 */
import { useState } from 'react';

import TermSelect from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof TermSelect> = {
	title: 'Components/TermSelect',
	component: TermSelect,
};

export default meta;

type Story = StoryObj<typeof TermSelect>;

interface SelectedTerm {
	id: number;
	name: string;
	slug: string;
}

function TermSelectDemo({ maxTerms }: { maxTerms?: number }) {
	const [selected, setSelected] = useState<SelectedTerm | null>(null);
	const [tokens, setTokens] = useState<string[]>([]);
	return (
		<div style={{ maxWidth: 360 }}>
			<TermSelect
				taxonomy="category"
				label="Select a topic"
				value={tokens}
				maxTerms={maxTerms}
				onChange={(term: SelectedTerm | null) => {
					setSelected(term);
					setTokens(term ? [term.name] : []);
				}}
			/>
			{selected && <pre>{JSON.stringify(selected, null, 2)}</pre>}
		</div>
	);
}

export const Default: Story = {
	render: () => <TermSelectDemo />,
};
