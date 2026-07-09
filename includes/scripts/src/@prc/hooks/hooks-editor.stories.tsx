/**
 * Demos for the editor-coupled hooks in @prc/hooks, running against the real
 * core/editor store (EditorProvider decorator, fixture post) and the real
 * core/block-editor store (block editor decorator).
 */
import { useState } from 'react';

import { store as blockEditorStore } from '@wordpress/block-editor';
import { Notice, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';
// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withEditor } from '@prc-storybook/decorators/with-editor';

import useAfterPreview from './use-after-preview';
import useAfterPublish from './use-after-publish';
import useDeviceBoundAttribute from './use-device-bound-attribute';
import useHasSelectedInnerBlock from './use-has-innerblock-selected';
import useMetaStatefully from './use-meta-statefully';
import useMinWordGate from './use-min-word-gate';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta = {
	title: 'Hooks/Editor',
};

export default meta;

function UseMetaStatefullyDemo() {
	const [value, setValue] = useMetaStatefully(
		'_storybook_demo_meta',
		'Initial meta value'
	);
	return (
		<div style={{ maxWidth: 420 }}>
			<TextControl
				label="Post meta: _storybook_demo_meta"
				value={value}
				onChange={setValue}
				help="Writes to the real core/editor edited post (debounced 500ms)."
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

function WaitForEditorMeta({ children }: { children: JSX.Element }) {
	// EditorProvider sets up the post asynchronously; useMetaStatefully reads
	// `meta[key]` unguarded, so hold the demo until meta exists.
	const hasMeta = useSelect(
		(select) =>
			Boolean(
				(
					select('core/editor') as {
						getEditedPostAttribute: (attr: string) => unknown;
					}
				).getEditedPostAttribute('meta')
			),
		[]
	);
	return hasMeta ? children : <p>Setting up the editor…</p>;
}

export const UseMetaStatefully: StoryObj = {
	decorators: [withEditor],
	render: () => (
		<WaitForEditorMeta>
			<UseMetaStatefullyDemo />
		</WaitForEditorMeta>
	),
};

function UseMinWordGateDemo({ minWords }: { minWords: number }) {
	const { gateActive, hasEnoughContent } = useMinWordGate(minWords);
	return (
		<Notice
			status={hasEnoughContent ? 'success' : 'warning'}
			isDismissible={false}
		>
			Gate {gateActive ? 'active' : 'inactive'} at {minWords} words — the
			fixture post {hasEnoughContent ? 'meets' : 'does not meet'} the
			threshold.
		</Notice>
	);
}

export const UseMinWordGate: StoryObj = {
	decorators: [withEditor],
	render: () => (
		<div style={{ display: 'grid', gap: '1em' }}>
			<UseMinWordGateDemo minWords={10} />
			<UseMinWordGateDemo minWords={100} />
		</div>
	),
};

function UseAfterPreviewPublishDemo() {
	const [previewCount, setPreviewCount] = useState(0);
	const [publishCount, setPublishCount] = useState(0);
	useAfterPreview(() => setPreviewCount((n) => n + 1));
	useAfterPublish(() => setPublishCount((n) => n + 1));
	return (
		<Notice status="info" isDismissible={false}>
			These hooks fire callbacks after the editor finishes a preview or a
			publish. Previews observed: {previewCount} · Publishes observed:{' '}
			{publishCount}. (Trigger via core/editor dispatches in the console.)
		</Notice>
	);
}

export const UseAfterPreviewAndPublish: StoryObj = {
	decorators: [withEditor],
	render: () => <UseAfterPreviewPublishDemo />,
};

function StoryBlockClientId({
	children,
}: {
	children: (clientId: string) => JSX.Element;
}) {
	const clientId = useSelect((select) => {
		const { getBlocks } = select(blockEditorStore) as {
			getBlocks: () => { clientId: string; name: string }[];
		};
		return getBlocks().find((block) => block.name === 'prc-storybook/story')
			?.clientId;
	}, []);
	return clientId ? children(clientId) : null;
}

function UseDeviceBoundAttributeDemo({ clientId }: { clientId: string }) {
	const [maxWidth, setMaxWidth] = useDeviceBoundAttribute(
		clientId,
		'maxWidth'
	);
	return (
		<div style={{ maxWidth: 420 }}>
			<TextControl
				label="Max width (bound to the current editor device)"
				value={maxWidth}
				onChange={setMaxWidth}
				help="The value is stored per device (desktop/tablet/mobile) on the block's attributes."
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export const UseDeviceBoundAttribute: StoryObj = {
	decorators: [withBlockEditor],
	render: () => (
		<StoryBlockClientId>
			{(clientId) => <UseDeviceBoundAttributeDemo clientId={clientId} />}
		</StoryBlockClientId>
	),
};

function UseHasSelectedInnerBlockDemo({ clientId }: { clientId: string }) {
	const hasSelection = useHasSelectedInnerBlock(clientId);
	return (
		<Notice
			status={hasSelection ? 'success' : 'info'}
			isDismissible={false}
		>
			{hasSelection
				? 'This block (or one of its inner blocks) is selected.'
				: 'Click elsewhere in the canvas — this reports whether this block or its children hold the selection.'}
		</Notice>
	);
}

export const UseHasSelectedInnerBlock: StoryObj = {
	decorators: [withBlockEditor],
	render: () => (
		<StoryBlockClientId>
			{(clientId) => <UseHasSelectedInnerBlockDemo clientId={clientId} />}
		</StoryBlockClientId>
	),
};
