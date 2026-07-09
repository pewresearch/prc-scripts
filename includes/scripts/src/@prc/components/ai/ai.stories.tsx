/**
 * AI suggestion flow against the fixture Abilities API. useAISuggest's
 * `executeAbility` script-module import resolves through the import map in
 * .storybook/preview-head.html, and the REST fallback resolves through the
 * /wp-abilities/v1 fixture routes — both return the same fixture suggestions.
 */
import { useState } from 'react';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor';
// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook webpack alias.
import { withEditor } from '@prc-storybook/decorators/with-editor';

import AILoadingIndicator from './ai-loading-indicator';
import AISuggestButton from './ai-suggest-button';
import AISuggestModal from './ai-suggest-modal';
import AISuggestToolbarButton from './ai-suggest-toolbar-button';
import AISuggestionsList from './ai-suggestions-list';
import AINumberCheckBadge from './ai-number-check-badge';
import useAISuggest from './use-ai-suggest';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof AISuggestButton> = {
	title: 'Components/AI',
	component: AISuggestButton,
	// useMinWordGate selects from core/editor, so run inside the editor
	// decorator with the fixture post.
	decorators: [withEditor],
};

export default meta;

type Story = StoryObj<typeof AISuggestButton>;

function SuggestFlowDemo() {
	const { isLoading, error, result, fetch, dismissError } = useAISuggest<{
		suggestions: string[];
	}>({
		abilityName: 'prc-storybook/suggest',
	});
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
		new Set()
	);

	const suggestions = result?.suggestions ?? [];

	return (
		<div style={{ maxWidth: 320 }}>
			<AISuggestButton
				onClick={() => {
					setIsOpen(true);
					fetch();
				}}
				isLoading={isLoading}
			/>
			<AISuggestModal
				title="Suggested headlines"
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				isLoading={isLoading}
				loadingMessage="Asking the model for headline ideas…"
				error={error}
				onDismissError={dismissError}
			>
				<AISuggestionsList
					suggestions={suggestions}
					selectedIds={selectedIds}
					onToggle={(id) =>
						setSelectedIds((current) => {
							const next = new Set(current);
							if (next.has(id)) {
								next.delete(id);
							} else {
								next.add(id);
							}
							return next;
						})
					}
					getId={(item) => item}
					renderItem={(item) => item}
				/>
			</AISuggestModal>
		</div>
	);
}

export const SuggestFlow: Story = {
	render: () => <SuggestFlowDemo />,
};

export const Button: Story = {
	render: () => (
		<div style={{ maxWidth: 320 }}>
			<AISuggestButton onClick={() => {}} />
		</div>
	),
};

export const ButtonWithWordGate: Story = {
	render: () => (
		<div style={{ maxWidth: 320 }}>
			{/* The fixture post has ~30 words, so a 100-word gate disables the button. */}
			<AISuggestButton onClick={() => {}} minWords={100} />
		</div>
	),
};

export const LoadingIndicator: Story = {
	render: () => <AILoadingIndicator message="Generating suggestions…" />,
};

export const ToolbarButton: Story = {
	decorators: [withBlockEditor],
	render: () => (
		<>
			<p>
				This block&apos;s toolbar contains the AI suggest button
				(sparkle/update icon).
			</p>
			<AISuggestToolbarButton onClick={() => {}} />
		</>
	),
};

export const NumberCheckVerified: Story = {
	render: () => (
		<p style={{ fontSize: 13, lineHeight: 1.5 }}>
			<span
				style={{
					display: 'block',
					fontWeight: 600,
					fontSize: 11,
					color: '#757575',
					marginBottom: 4,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
				}}
			>
				Option 1{' '}
				<AINumberCheckBadge
					numberCheck={{ valid: true, flagged: [] }}
				/>
			</span>
			Some 89% of Americans use the internet, per a 2024 survey.
		</p>
	),
};

export const NumberCheckFlagged: Story = {
	render: () => (
		<p style={{ fontSize: 13, lineHeight: 1.5 }}>
			<span
				style={{
					display: 'block',
					fontWeight: 600,
					fontSize: 11,
					color: '#757575',
					marginBottom: 4,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
				}}
			>
				Option 2{' '}
				<AINumberCheckBadge
					numberCheck={{ valid: false, flagged: ['42%', '97%'] }}
				/>
			</span>
			A whopping 42% of cats and 97% of dogs use the internet.
		</p>
	),
};

export const NumberCheckAbsent: Story = {
	render: () => (
		<p style={{ fontSize: 13, lineHeight: 1.5 }}>
			<span
				style={{
					display: 'block',
					fontWeight: 600,
					fontSize: 11,
					color: '#757575',
					marginBottom: 4,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
				}}
			>
				Option 3 <AINumberCheckBadge />
			</span>
			No checker available — badge renders nothing (not a false verified).
		</p>
	),
};
