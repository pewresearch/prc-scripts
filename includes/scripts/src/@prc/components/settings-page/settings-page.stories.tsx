/**
 * Full settings-page demo: a real @wordpress/data store created via
 * createSettingsStore, a REST client via createSettingsClient, and the
 * SettingsPage accordion UI — all against the fixture endpoint
 * /prc-api/v3/storybook/settings. Rendered in a "WP Admin"-style shell.
 */
import { useCallback, useEffect, useState } from 'react';

import { TextControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import ConnectionBadge from './connection-badge';
import { createSettingsClient } from './create-settings-client';
import { createSettingsStore } from './create-settings-store';
import SettingsPage from './settings-page';
import SettingsSectionFooter from './settings-section-footer';
import { useSettingsDraft } from './use-settings-draft';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

interface DemoSettings {
	api_key: string;
	enabled: boolean;
	mode: string;
	sync_interval: number;
}

const DEFAULT_SETTINGS: DemoSettings = {
	api_key: '',
	enabled: false,
	mode: 'production',
	sync_interval: 15,
};

const demoStore = createSettingsStore<
	DemoSettings,
	{ settings: DemoSettings; isLoaded: boolean }
>({
	name: 'prc-storybook/settings-page-demo',
	defaultState: { settings: DEFAULT_SETTINGS, isLoaded: false },
});

// Holds the latest edits from the Connection section so the shared client can
// POST the draft (createSettingsClient reads getSaveData) instead of the stale
// store snapshot.
let connectionDraft: DemoSettings = DEFAULT_SETTINGS;

const demoClient = createSettingsClient<DemoSettings>({
	restPath: '/prc-api/v3/storybook/settings',
	store: demoStore,
	successMessage: 'Settings saved.',
	getSaveData: () => connectionDraft,
});

function ConnectionSection() {
	const settings = useSelect(
		(select) =>
			(
				select(demoStore) as { getSettings: () => DemoSettings }
			).getSettings(),
		[]
	);
	const [draft, setDraft] = useSettingsDraft<DemoSettings>(settings);
	const [isBusy, setIsBusy] = useState(false);

	useEffect(() => {
		connectionDraft = draft;
	}, [draft]);

	return (
		<div>
			<ConnectionBadge connected={Boolean(draft.api_key)} />
			<TextControl
				label="API key"
				value={draft.api_key}
				onChange={(api_key) => setDraft({ ...draft, api_key })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label="Enable sync"
				checked={draft.enabled}
				onChange={(enabled) => setDraft({ ...draft, enabled })}
				__nextHasNoMarginBottom
			/>
			<SettingsSectionFooter
				saveLabel="Save connection settings"
				isBusy={isBusy}
				onSave={async () => {
					setIsBusy(true);
					try {
						await demoClient.saveSettings();
					} finally {
						setIsBusy(false);
					}
				}}
			/>
		</div>
	);
}

function SettingsPageDemo() {
	const onLoad = useCallback(() => demoClient.fetchSettings(), []);
	return (
		<div style={{ background: '#f0f0f1', padding: '2em', minHeight: 480 }}>
			<div style={{ maxWidth: 720, margin: '0 auto' }}>
				<SettingsPage
					title="PRC Storybook Settings"
					description="A demo settings page backed by fixture REST data."
					textDomain="prc-storybook"
					onLoad={onLoad}
					sections={[
						{
							slug: 'connection',
							title: 'Connection',
							description:
								'Configure the (fictional) service connection.',
							render: () => <ConnectionSection />,
						},
						{
							slug: 'about',
							title: 'About',
							description: 'What this demo shows.',
							render: () => (
								<p>
									This section demonstrates the
									SettingsAccordion / SettingsSubSection
									layout primitives.
								</p>
							),
						},
					]}
				/>
			</div>
		</div>
	);
}

const meta: Meta<typeof SettingsPage> = {
	title: 'Components/SettingsPage',
	component: SettingsPage,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

export const Default: Story = {
	render: () => <SettingsPageDemo />,
};

export const Badges: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1em', padding: '2em' }}>
			<ConnectionBadge connected />
			<ConnectionBadge connected={false} />
		</div>
	),
};
