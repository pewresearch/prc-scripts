import { useState } from 'react';

import { Button } from '@wordpress/components';

import EntityCreateNewModal from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof EntityCreateNewModal> = {
	title: 'Components/EntityCreateNewModal',
	component: EntityCreateNewModal,
};

export default meta;

type Story = StoryObj<typeof EntityCreateNewModal>;

function ModalDemo() {
	const [isOpen, setIsOpen] = useState(true);
	const [created, setCreated] = useState<string | null>(null);
	return (
		<div>
			<Button variant="primary" onClick={() => setIsOpen(true)}>
				Create new block area
			</Button>
			{created && (
				<p>
					Created: <strong>{created}</strong>
				</p>
			)}
			{isOpen && (
				<EntityCreateNewModal
					entityType="block area"
					defaultTitle="New Block Area"
					onClose={() => setIsOpen(false)}
					onSubmit={(title: string) => {
						setCreated(title);
						setIsOpen(false);
					}}
				/>
			)}
		</div>
	);
}

export const Default: Story = {
	render: () => <ModalDemo />,
};
