/**
 * LimitControls hides its children when the current block's parent matches a
 * provided list. The second story runs inside the real block editor decorator
 * against the live core/block-editor store.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';

import LimitControls from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof LimitControls> = {
	title: 'Controls/LimitControls',
	component: LimitControls,
};

export default meta;

type Story = StoryObj<typeof LimitControls>;

export const Default: Story = {
	render: () => (
		<LimitControls>
			<Notice status="info" isDismissible={false}>
				Visible: no parent restrictions were provided.
			</Notice>
		</LimitControls>
	),
};

function InsideEditorDemo({ parentList }: { parentList: string[] }) {
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
		<LimitControls
			checkParents={{ blockEditorStore, parentList, clientId }}
		>
			<Notice status="info" isDismissible={false}>
				Visible: this block&apos;s parent is not in [
				{parentList.join(', ')}].
			</Notice>
		</LimitControls>
	);
}

export const InsideBlockEditor: Story = {
	decorators: [withBlockEditor],
	render: () => <InsideEditorDemo parentList={['core/group']} />,
};
