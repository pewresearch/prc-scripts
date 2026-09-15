import { useState } from 'react';

import IconPicker from './index';

import type { IconPickerValue } from './index';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof IconPicker> = {
	title: 'Components/IconPicker',
	component: IconPicker,
};

export default meta;

type Story = StoryObj<typeof IconPicker>;

function IconPickerDemo({
	showPosition,
	showSearch,
}: {
	showPosition?: boolean;
	showSearch?: boolean;
}) {
	const [value, setValue] = useState<IconPickerValue>({
		library: 'prc',
		icon: 'magnifying-glass',
		position: 'left',
	});
	return (
		<div style={{ maxWidth: 360 }}>
			<IconPicker
				library={value.library ?? 'prc'}
				icon={value.icon}
				position={value.position}
				onChange={(next) =>
					setValue((current) => ({ ...current, ...next }))
				}
				showPosition={showPosition}
				showSearch={showSearch}
			/>
			<pre>{JSON.stringify(value, null, 2)}</pre>
		</div>
	);
}

export const Default: Story = {
	render: () => <IconPickerDemo />,
};

export const WithoutPositionOrSearch: Story = {
	render: () => <IconPickerDemo showPosition={false} showSearch={false} />,
};
