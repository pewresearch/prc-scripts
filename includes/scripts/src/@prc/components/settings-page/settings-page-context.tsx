import { createContext, useContext } from '@wordpress/element';
import type { StoreDescriptor } from '@wordpress/data';

export interface SettingsPageContextValue {
	store: StoreDescriptor;
	saveSettings: (options?: { successMessage?: string }) => Promise<unknown>;
	textDomain: string;
}

export const SettingsPageContext =
	createContext<SettingsPageContextValue | null>(null);

export function useSettingsPageContext(): SettingsPageContextValue {
	const context = useContext(SettingsPageContext);

	if (!context) {
		throw new Error(
			'Settings fields sections require SettingsPageContext. Pass store and saveSettings to SettingsPage.'
		);
	}

	return context;
}
