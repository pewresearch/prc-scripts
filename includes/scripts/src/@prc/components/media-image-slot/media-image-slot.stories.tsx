/**
 * MediaImageSlot reads the current post id from the real core/editor store,
 * so this story runs inside the EditorProvider decorator with a fixture post.
 */
import { useState } from 'react';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withEditor } from '@prc-storybook/decorators/with-editor';

import MediaImageSlot from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MediaImageSlot> = {
	title: 'Components/MediaImageSlot',
	component: MediaImageSlot,
	decorators: [withEditor],
};

export default meta;

type Story = StoryObj<typeof MediaImageSlot>;

function MediaImageSlotDemo({ initialId }: { initialId?: number }) {
	const [id, setId] = useState<number | undefined>(initialId);
	return (
		<div style={{ maxWidth: 420 }}>
			<MediaImageSlot
				id={id}
				size="A1"
				onUpdate={(image: { id: number }) => setId(image.id)}
			/>
		</div>
	);
}

export const Empty: Story = {
	render: () => <MediaImageSlotDemo />,
};

export const WithImage: Story = {
	render: () => <MediaImageSlotDemo initialId={501} />,
};
