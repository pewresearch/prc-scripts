import type { ReactNode } from 'react';
import type { StoreDescriptor } from '@wordpress/data';

export interface SettingsApiResponse<TSettings> {
	settings?: TSettings;
	[key: string]: unknown;
}

export interface SettingsStoreState<TSettings> {
	settings: TSettings;
	isLoaded: boolean;
	[key: string]: unknown;
}

export type SettingsFieldType =
	| 'boolean'
	| 'text'
	| 'textarea'
	| 'integer'
	| 'number'
	| 'email'
	| 'password'
	| 'select';

export interface SettingsFieldOption {
	value: string | number;
	label: string;
}

export interface SettingsFieldConfig {
	id: string;
	label: string;
	description?: string;
	type: SettingsFieldType;
	edit?: string | { control: string; rows?: number };
	options?: SettingsFieldOption[];
	autoSave?: boolean;
	min?: number;
	max?: number;
	rows?: number;
	placeholder?: string;
	format?: (value: unknown, settings: Record<string, unknown>) => unknown;
	parse?: (value: unknown, settings: Record<string, unknown>) => unknown;
	isVisible?: (settings: Record<string, unknown>) => boolean;
	isDisabled?: (settings: Record<string, unknown>) => boolean;
	annotation?: () => ReactNode;
}

export interface SettingsAccordionProps {
	slug?: string;
	title: string;
	description: string;
	children: ReactNode;
	textDomain: string;
	contentId?: string;
	headingId?: string;
	descriptionId?: string;
	badge?: ReactNode;
	intro?: ReactNode;
	defaultOpen?: boolean;
}

export interface SettingsSubSectionProps {
	title: string;
	children: ReactNode;
	textDomain: string;
	isOpen: boolean;
	onToggle: () => void;
	contentId?: string;
}

export interface SettingsSectionConfig {
	slug: string;
	title: string;
	description: string;
	fields?: SettingsFieldConfig[];
	render?: () => ReactNode;
	badge?: () => ReactNode;
	intro?: () => ReactNode;
	footer?: () => ReactNode;
	saveLabel?: string;
	defaultOpen?: boolean;
}

export interface SettingsPageProps {
	title: string;
	description: ReactNode;
	textDomain: string;
	sections: SettingsSectionConfig[];
	onLoad: () => Promise<unknown>;
	store?: StoreDescriptor;
	saveSettings?: (options?: { successMessage?: string }) => Promise<unknown>;
	actions?: ReactNode;
	intro?: ReactNode;
	errorLoadingLabel?: string;
	errorRetryLabel?: string;
	className?: string;
	idPrefix?: string;
}

export interface SettingsFieldsSectionProps {
	slug: string;
	title: string;
	description?: string;
	fields: SettingsFieldConfig[];
	intro?: ReactNode;
	badge?: ReactNode;
	footer?: ReactNode;
	defaultOpen?: boolean;
}

export interface ConnectionBadgeProps {
	connected: boolean;
	connectedLabel?: string;
	disconnectedLabel?: string;
	textDomain?: string;
}

export interface SettingsSectionFooterProps {
	onSave: () => void | Promise<void>;
	isBusy?: boolean;
	error?: string | null;
	onDismissError?: () => void;
	saveLabel: string;
	savingLabel?: string;
}

export interface CreateSettingsStoreConfig<
	TSettings,
	TState extends SettingsStoreState<TSettings>,
	TResponse extends SettingsApiResponse<TSettings> =
		SettingsApiResponse<TSettings>,
> {
	name: string;
	defaultState: TState;
	getSettingsFromResponse?: (response: TResponse) => TSettings;
	mapResponseToState?: (
		state: TState,
		response: TResponse
	) => Partial<TState>;
	extraActions?: Record<
		string,
		(...args: never[]) => { type: string; [key: string]: unknown }
	>;
	extraReducer?: (
		state: TState,
		action: { type: string; [key: string]: unknown }
	) => TState | null;
	extraSelectors?: Record<string, (state: TState) => unknown>;
}

export interface CreateSettingsClientConfig<
	TSettings,
	TResponse extends SettingsApiResponse<TSettings> =
		SettingsApiResponse<TSettings>,
> {
	restPath: string;
	store: StoreDescriptor;
	successMessage: string;
	getSaveData?: () => TSettings;
	onResponse?: (response: TResponse) => void;
}

export interface CreatePartialSaveClientConfig<
	TResponse extends SettingsApiResponse<unknown> =
		SettingsApiResponse<unknown>,
> {
	restPath: string;
	successMessage: string;
	onResponse: (response: TResponse) => void;
}

export interface SaveSettingsOptions {
	successMessage?: string;
}
