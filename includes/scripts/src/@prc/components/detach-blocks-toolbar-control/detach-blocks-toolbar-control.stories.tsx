/**
 * Renders inside the real block editor decorator: the control fills the
 * selected block's toolbar (BlockControls) with an "ungroup" button that
 * replaces the sibling group block with its inner blocks.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { BlockEditorDecorator } from '@prc-storybook/decorators/with-block-editor';

import DetachBlocksToolbarControl from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof DetachBlocksToolbarControl> = {
	title: 'Components/DetachBlocksToolbarControl',
	component: DetachBlocksToolbarControl,
};

export default meta;

type Story = StoryObj<typeof DetachBlocksToolbarControl>;

function DetachDemo() {
	const groupClientId = useSelect((select) => {
		const { getBlocks } = select(blockEditorStore) as {
			getBlocks: () => { clientId: string; name: string }[];
		};
		return getBlocks().find((block) => block.name === 'core/group')
			?.clientId;
	}, []);

	if (!groupClientId) {
		return (
			<Notice status="success" isDismissible={false}>
				The group block was detached into its inner blocks.
			</Notice>
		);
	}

	return (
		<>
			<Notice status="info" isDismissible={false}>
				This block is selected — use the &quot;Detach&quot; button in
				its toolbar to replace the sibling group block with its inner
				blocks.
			</Notice>
			<DetachBlocksToolbarControl clientId={groupClientId} />
		</>
	);
}

export const Default: Story = {
	render: () => (
		<BlockEditorDecorator
			// Factory: evaluated after core blocks are registered.
			siblingBlocks={() => [
				createBlock('core/group', {}, [
					createBlock('core/paragraph', {
						content: 'First paragraph inside the group.',
					}),
					createBlock('core/paragraph', {
						content: 'Second paragraph inside the group.',
					}),
				]),
			]}
		>
			<DetachDemo />
		</BlockEditorDecorator>
	),
};
