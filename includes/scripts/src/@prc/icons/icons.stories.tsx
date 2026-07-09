import { useState } from 'react';

import { SearchControl, SelectControl } from '@wordpress/components';

// eslint-disable-next-line import/no-unresolved -- resolved via the Storybook @prc/* webpack alias.
import { Icon, IconLibraryIndex } from '@prc/icons';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta = {
	title: 'Icons/Icon',
};

export default meta;

const libraries = Object.keys(IconLibraryIndex as Record<string, string[]>);

export const Single: StoryObj<{
	library: string;
	icon: string;
	size: number;
}> = {
	argTypes: {
		library: { control: 'select', options: libraries },
	},
	args: {
		library: 'solid',
		icon: 'chart-line',
		size: 3,
	},
	render: (args) => (
		<Icon library={args.library} icon={args.icon} size={args.size} />
	),
};

function IconGallery() {
	const [library, setLibrary] = useState('solid');
	const [search, setSearch] = useState('');
	const icons = (
		(IconLibraryIndex as Record<string, string[]>)[library] ?? []
	).filter((name) => !search || name.includes(search.toLowerCase()));

	return (
		<div>
			<div
				style={{
					display: 'flex',
					gap: '1em',
					alignItems: 'flex-end',
					maxWidth: 480,
				}}
			>
				<SelectControl
					label="Library"
					value={library}
					options={libraries.map((lib) => ({
						label: lib,
						value: lib,
					}))}
					onChange={setLibrary}
					__nextHasNoMarginBottom
				/>
				<SearchControl
					label="Search icons"
					value={search}
					onChange={setSearch}
					__nextHasNoMarginBottom
				/>
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
					gap: '0.5em',
					marginTop: '1em',
				}}
			>
				{icons.slice(0, 120).map((name) => (
					<div
						key={name}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '0.5em',
							padding: '0.75em 0.25em',
							border: '1px solid #eee',
							borderRadius: 4,
							fontSize: 11,
							wordBreak: 'break-all',
							textAlign: 'center',
						}}
					>
						<Icon library={library} icon={name} size={1.5} />
						<span>{name}</span>
					</div>
				))}
			</div>
			{icons.length > 120 && (
				<p>Showing first 120 of {icons.length} icons.</p>
			)}
		</div>
	);
}

export const Gallery: StoryObj = {
	render: () => <IconGallery />,
};
