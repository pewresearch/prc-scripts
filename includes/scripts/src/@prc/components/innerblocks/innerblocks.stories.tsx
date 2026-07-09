/**
 * InnerBlocksAsSyncedContent renders another post's blocks as editable inner
 * blocks. It runs here inside the real block editor decorator; the entity
 * record (post 101) resolves through core-data from the posts fixture, and its
 * `content.raw` is parsed into real core blocks.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';

import { InnerBlocksAsSyncedContent } from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof InnerBlocksAsSyncedContent> = {
	title: 'Components/InnerBlocks/AsSyncedContent',
	component: InnerBlocksAsSyncedContent,
	decorators: [withBlockEditor],
};

export default meta;

type Story = StoryObj<typeof InnerBlocksAsSyncedContent>;

function SyncedContentDemo({ postId }: { postId: number | null }) {
	const clientId = useSelect((select) => {
		const { getBlocks } = select(blockEditorStore) as {
			getBlocks: () => { clientId: string; name: string }[];
		};
		return getBlocks().find((block) => block.name === 'prc-storybook/story')
			?.clientId;
	}, []);

	if (!clientId) {
		return null;
	}

	return (
		<InnerBlocksAsSyncedContent
			postId={postId}
			postType="post"
			postTypeLabel="Report"
			clientId={clientId}
			allowDetach
		/>
	);
}

export const Default: Story = {
	render: () => <SyncedContentDemo postId={101} />,
};

export const MissingRecord: Story = {
	render: () => <SyncedContentDemo postId={9999} />,
};
