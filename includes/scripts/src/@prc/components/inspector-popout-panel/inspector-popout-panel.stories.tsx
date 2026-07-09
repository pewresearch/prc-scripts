import { Button, TextControl } from '@wordpress/components';

import InspectorPopoutPanel from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof InspectorPopoutPanel> = {
	title: 'Components/InspectorPopoutPanel',
	component: InspectorPopoutPanel,
};

export default meta;

type Story = StoryObj<typeof InspectorPopoutPanel>;

export const Default: Story = {
	render: () => (
		<div
			style={{
				maxWidth: 280,
				marginLeft: 'auto',
				borderLeft: '1px solid #e0e0e0',
				padding: '1em',
				minHeight: 320,
			}}
		>
			<InspectorPopoutPanel
				title="Publication date"
				renderToggle={({
					isOpen,
					onToggle,
				}: {
					isOpen: boolean;
					onToggle: () => void;
				}) => (
					<Button
						variant="tertiary"
						onClick={onToggle}
						aria-expanded={isOpen}
					>
						May 12, 2026
					</Button>
				)}
			>
				<div style={{ padding: '1em', minWidth: 240 }}>
					<TextControl
						label="Date"
						value="2026-05-12"
						onChange={() => {}}
						__nextHasNoMarginBottom
					/>
				</div>
			</InspectorPopoutPanel>
		</div>
	),
};
