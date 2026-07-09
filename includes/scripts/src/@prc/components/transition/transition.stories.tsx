import { useState } from 'react';

import { Button } from '@wordpress/components';

import Transition from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof Transition> = {
	title: 'Components/Transition',
	component: Transition,
};

export default meta;

type Story = StoryObj<typeof Transition>;

function TransitionDemo() {
	const [generation, setGeneration] = useState(0);
	return (
		<div>
			<Button
				variant="secondary"
				onClick={() => setGeneration((n) => n + 1)}
			>
				Replay fade-in
			</Button>
			<Transition key={generation}>
				<p>
					This content fades in via framer-motion each time it mounts.
				</p>
			</Transition>
		</div>
	);
}

export const Default: Story = {
	render: () => <TransitionDemo />,
};
