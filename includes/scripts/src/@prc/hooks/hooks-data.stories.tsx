/**
 * Demos for the data-layer hooks in @prc/hooks. Entity hooks resolve through
 * the real @wordpress/core-data store; presence hooks poll the fixture-backed
 * /wp-presence/v1 routes (enabled via window.prcPlatform.presenceApiEnabled).
 */
import { useMemo, useState } from 'react';

import { SelectControl } from '@wordpress/components';

import useDeclarePresence from './use-declare-presence';
import useMultiEntityRecords from './use-multi-entity-records';
import usePostIdsAsOptions from './use-postids-as-options';
import usePresenceUsers from './use-presence-users';
import useTaxonomy from './use-taxonomy';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta = {
	title: 'Hooks/Data',
};

export default meta;

function UseTaxonomyDemo() {
	const [taxId, taxName] = useTaxonomy('category', 'internet-technology');
	return (
		<p>
			Term with slug <code>internet-technology</code> resolves to:{' '}
			<strong>{taxName ?? '…'}</strong> (id: {taxId ?? '…'})
		</p>
	);
}

export const UseTaxonomy: StoryObj = {
	render: () => <UseTaxonomyDemo />,
};

function UseMultiEntityRecordsDemo() {
	const entitySubTypes = useMemo(() => ['post', 'page'], []);
	const entityArgs = useMemo(() => ({ per_page: 5 }), []);
	const { records, isResolving } = useMultiEntityRecords(
		'postType',
		entitySubTypes,
		entityArgs,
		{ enabled: true }
	);
	return (
		<div>
			<p>
				{isResolving
					? 'Resolving…'
					: `${records.length} records across post + page`}
			</p>
			<ul>
				{records.map((record: { id: number; slug: string }) => (
					<li key={record.id}>{record.slug}</li>
				))}
			</ul>
		</div>
	);
}

export const UseMultiEntityRecords: StoryObj = {
	render: () => <UseMultiEntityRecordsDemo />,
};

function UsePostIdsAsOptionsDemo() {
	const options = usePostIdsAsOptions([101, 102, 103]);
	const [value, setValue] = useState<string | undefined>(undefined);
	return (
		<div style={{ maxWidth: 420 }}>
			<SelectControl
				label="Pick a report (options built from post ids)"
				value={value}
				options={options}
				onChange={setValue}
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export const UsePostIdsAsOptions: StoryObj = {
	render: () => <UsePostIdsAsOptionsDemo />,
};

function UsePresenceUsersDemo() {
	const { isPresent, users } = usePresenceUsers('storybook/demo', {
		includeSelf: true,
	});
	return (
		<div>
			<p>
				Room <code>storybook/demo</code> is{' '}
				<strong>{isPresent ? 'occupied' : 'empty'}</strong>.
			</p>
			<ul>
				{users.map((user) => (
					<li key={user.userId}>
						{user.displayName}{' '}
						<code>{JSON.stringify(user.data)}</code>
					</li>
				))}
			</ul>
		</div>
	);
}

export const UsePresenceUsers: StoryObj = {
	render: () => <UsePresenceUsersDemo />,
};

function UseDeclarePresenceDemo() {
	useDeclarePresence('storybook/demo', {
		data: { state: 'storybook-demo' },
	});
	const { users } = usePresenceUsers('storybook/demo', {
		includeSelf: true,
	});
	return (
		<div>
			<p>
				This story declares its own presence in{' '}
				<code>storybook/demo</code> (POST) and observes the room:
			</p>
			<ul>
				{users.map((user) => (
					<li key={user.userId}>{user.displayName}</li>
				))}
			</ul>
		</div>
	);
}

export const UseDeclarePresence: StoryObj = {
	render: () => <UseDeclarePresenceDemo />,
};
