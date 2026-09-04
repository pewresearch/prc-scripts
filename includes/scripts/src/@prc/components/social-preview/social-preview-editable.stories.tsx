/**
 * Editable social previews use RichText and MediaUpload from
 * the WordPress block editor, so they run inside the real block editor decorator.
 * The media picker is the fixture-backed editor.MediaUpload mock.
 */
import { useState } from 'react';

// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -- Storybook alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';

import {
	FacebookPreview,
	TwitterPreview,
	BlueskyPreview,
	LinkedInPreview,
} from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const SHARED_ARGS = {
	title: 'How Americans View Artificial Intelligence',
	description:
		'A majority of U.S. adults say they interact with AI several times a day.',
	url: 'https://www.pewresearch.org/internet/2026/05/12/how-americans-view-artificial-intelligence/',
	image: 'https://placehold.co/1200x630/png',
	siteName: 'Pew Research Center',
	displayName: 'Pew Research Center',
	verified: true,
};

const meta: Meta<typeof FacebookPreview> = {
	title: 'Components/SocialPreview/Editable',
	component: FacebookPreview,
	decorators: [withBlockEditor],
	args: SHARED_ARGS,
};

export default meta;

type Story = StoryObj<typeof FacebookPreview>;

function useEditableCallbacks(initialText: string) {
	const [text, setText] = useState(initialText);
	const [mediaId, setMediaId] = useState<number | undefined>(undefined);
	return {
		text,
		mediaId,
		editableCallbacks: {
			onContentChange: setText,
			onMediaSelect: (media: { id: number }) => setMediaId(media.id),
			onMediaRemove: () => setMediaId(undefined),
		},
	};
}

function EditableFacebookDemo(args: Record<string, unknown>) {
	const { text, mediaId, editableCallbacks } = useEditableCallbacks(
		'Most Americans now encounter AI in daily life.'
	);
	return (
		<FacebookPreview
			{...args}
			isEditable
			isSelected
			postText={text}
			mediaId={mediaId}
			charLimit={280}
			editableCallbacks={editableCallbacks}
		/>
	);
}

function EditableTwitterDemo(args: Record<string, unknown>) {
	const { text, mediaId, editableCallbacks } = useEditableCallbacks(
		'Most Americans now encounter AI in daily life.'
	);
	return (
		<TwitterPreview
			{...args}
			isEditable
			isSelected
			username="@pewresearch"
			tweetText={text}
			mediaId={mediaId}
			charLimit={280}
			numberCheck={{ valid: true, flagged: [] }}
			editableCallbacks={editableCallbacks}
		/>
	);
}

function EditableBlueskyDemo(args: Record<string, unknown>) {
	const { text, mediaId, editableCallbacks } = useEditableCallbacks(
		'Most Americans now encounter AI in daily life.'
	);
	return (
		<BlueskyPreview
			{...args}
			isEditable
			isSelected
			handle="@pewresearch.bsky.social"
			postText={text}
			mediaId={mediaId}
			charLimit={300}
			editableCallbacks={editableCallbacks}
		/>
	);
}

function EditableLinkedInDemo(args: Record<string, unknown>) {
	const { text, editableCallbacks } = useEditableCallbacks(
		'Most Americans now encounter AI in daily life.'
	);
	return (
		<LinkedInPreview
			{...args}
			isEditable
			isSelected
			postText={text}
			charLimit={3000}
			editableCallbacks={editableCallbacks}
		/>
	);
}

export const Facebook: Story = {
	render: (args) => <EditableFacebookDemo {...args} />,
};

export const Twitter: Story = {
	render: (args) => <EditableTwitterDemo {...args} />,
};

export const Bluesky: Story = {
	render: (args) => <EditableBlueskyDemo {...args} />,
};

export const LinkedIn: Story = {
	render: (args) => <EditableLinkedInDemo {...args} />,
};

function TextSlotTwitterDemo(args: Record<string, unknown>) {
	return (
		<TwitterPreview
			{...args}
			isSelected
			username="@pewresearch"
			tweetText="Most Americans now encounter AI in daily life."
			charLimit={280}
			numberCheck={{ valid: true, flagged: [] }}
			textSlot={
				<p style={{ margin: 0 }}>
					Most Americans now encounter AI in daily life.
				</p>
			}
		/>
	);
}

export const TwitterTextSlot: Story = {
	render: (args) => <TextSlotTwitterDemo {...args} />,
};
