/**
 * EntityPatternModal maps entity records (posts fixture, context=edit) to
 * block patterns and renders live BlockPreview thumbnails — core blocks are
 * registered by the block editor decorator.
 */
import { useState } from 'react';

import { Button } from '@wordpress/components';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';

import EntityPatternModal from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof EntityPatternModal> = {
	title: 'Components/EntityPatternModal',
	component: EntityPatternModal,
	decorators: [withBlockEditor],
};

export default meta;

type Story = StoryObj<typeof EntityPatternModal>;

function EntityPatternModalDemo() {
	const [isOpen, setIsOpen] = useState(true);
	const [selected, setSelected] = useState<string | null>(null);
	return (
		<div>
			<Button variant="primary" onClick={() => setIsOpen(true)}>
				Choose an existing report
			</Button>
			{selected && (
				<p>
					Selected: <strong>{selected}</strong>
				</p>
			)}
			{isOpen && (
				<EntityPatternModal
					title="Choose a report"
					instructions="Pick an existing report to reuse its layout."
					entityType="post"
					entityTypeLabel="Report"
					onSelect={(pattern: { title: string }) =>
						setSelected(pattern.title)
					}
					onClose={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}

export const Default: Story = {
	render: () => <EntityPatternModalDemo />,
};
