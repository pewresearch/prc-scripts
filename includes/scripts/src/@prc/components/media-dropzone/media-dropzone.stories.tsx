/**
 * MediaDropZone resolves attachments through the real core-data store
 * (fixture-backed) and opens the mocked `editor.MediaUpload` picker, which
 * immediately selects a fixture attachment.
 */
import { useState } from 'react';

import MediaDropZone from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof MediaDropZone> = {
	title: 'Components/MediaDropZone',
	component: MediaDropZone,
};

export default meta;

type Story = StoryObj<typeof MediaDropZone>;

function MediaDropZoneDemo({
	attachmentId,
}: {
	attachmentId?: number | false;
}) {
	const [lastSelected, setLastSelected] = useState<unknown>(null);
	return (
		<div style={{ maxWidth: 360 }}>
			<MediaDropZone
				attachmentId={attachmentId}
				mediaSize="A3"
				singularLabel="image"
				onUpdate={(attachment: { id: number }) =>
					setLastSelected(attachment.id)
				}
				onClear={() => setLastSelected(null)}
			/>
			{Boolean(lastSelected) && (
				<p>
					Selected attachment id: <code>{String(lastSelected)}</code>
				</p>
			)}
		</div>
	);
}

export const Empty: Story = {
	render: () => <MediaDropZoneDemo />,
};

export const WithAttachment: Story = {
	render: () => <MediaDropZoneDemo attachmentId={501} />,
};
