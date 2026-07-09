import { useState } from 'react';

import { Toolbar } from '@wordpress/components';

import HeadingLevelToolbar from './index';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof HeadingLevelToolbar> = {
	title: 'Components/HeadingLevelToolbar',
	component: HeadingLevelToolbar,
};

export default meta;

type Story = StoryObj<typeof HeadingLevelToolbar>;

function ToolbarDemo({ levels }: { levels?: number[] }) {
	const [level, setLevel] = useState(2);
	return (
		<div>
			<Toolbar label="Heading level">
				<HeadingLevelToolbar
					selectedLevel={level}
					levels={levels}
					onChange={setLevel}
				/>
			</Toolbar>
			<p>
				Selected level: <strong>H{level}</strong>
			</p>
		</div>
	);
}

export const Default: Story = {
	render: () => <ToolbarDemo />,
};

export const AllLevels: Story = {
	render: () => <ToolbarDemo levels={[1, 2, 3, 4, 5, 6]} />,
};
