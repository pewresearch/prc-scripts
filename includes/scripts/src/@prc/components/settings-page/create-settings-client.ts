import apiFetch from '@wordpress/api-fetch';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

import type {
	CreatePartialSaveClientConfig,
	CreateSettingsClientConfig,
	SaveSettingsOptions,
	SettingsApiResponse,
} from './types';

type QueuedSave<TResponse> = {
	options?: SaveSettingsOptions;
	resolve: (value: TResponse) => void;
	reject: (reason?: unknown) => void;
};

export function createSettingsClient<
	TSettings,
	TResponse extends SettingsApiResponse<TSettings> =
		SettingsApiResponse<TSettings>,
>(config: CreateSettingsClientConfig<TSettings, TResponse>) {
	const { restPath, store, successMessage, getSaveData, onResponse } = config;
	let saveGeneration = 0;
	const queue: Array<QueuedSave<TResponse>> = [];
	let draining = false;

	async function fetchSettings(): Promise<TResponse> {
		const { setFromResponse } = dispatch(store);
		const response = (await apiFetch({ path: restPath })) as TResponse;
		setFromResponse(response);
		if (onResponse) {
			onResponse(response);
		}
		return response;
	}

	async function persist(options?: SaveSettingsOptions): Promise<TResponse> {
		const settings = getSaveData
			? getSaveData()
			: (select(store).getSettings() as TSettings);
		const generation = ++saveGeneration;

		const response = (await apiFetch({
			path: restPath,
			method: 'POST',
			data: settings,
		})) as TResponse;

		if (generation !== saveGeneration) {
			return response;
		}

		const { setFromResponse } = dispatch(store);
		const { createSuccessNotice } = dispatch(noticesStore);

		setFromResponse(response);
		if (onResponse) {
			onResponse(response);
		}

		createSuccessNotice(options?.successMessage ?? successMessage, {
			type: 'snackbar',
		});

		return response;
	}

	async function drainQueue() {
		if (draining) {
			return;
		}

		draining = true;
		try {
			while (queue.length > 0) {
				// Coalesce every waiter that arrived before this persist into one
				// POST of the latest store snapshot (full-document saves).
				const items = queue.splice(0, queue.length);
				const options = items[items.length - 1]?.options;

				try {
					const response = await persist(options);
					for (const item of items) {
						item.resolve(response);
					}
				} catch (error) {
					for (const item of items) {
						item.reject(error);
					}
				}
			}
		} finally {
			draining = false;
			if (queue.length > 0) {
				void drainQueue();
			}
		}
	}

	function saveSettings(options?: SaveSettingsOptions): Promise<TResponse> {
		return new Promise<TResponse>((resolve, reject) => {
			if (draining) {
				// Invalidate in-flight hydration so a slower earlier POST cannot
				// clobber patches applied while it was outstanding.
				saveGeneration += 1;
			}

			queue.push({ options, resolve, reject });
			void drainQueue();
		});
	}

	return { fetchSettings, saveSettings };
}

export function createPartialSaveClient<
	TResponse extends SettingsApiResponse<unknown> =
		SettingsApiResponse<unknown>,
>(config: CreatePartialSaveClientConfig<TResponse>) {
	const { restPath, successMessage, onResponse } = config;

	async function savePartial(
		data: Record<string, unknown>
	): Promise<TResponse> {
		const { createSuccessNotice } = dispatch(noticesStore);

		const response = (await apiFetch({
			path: restPath,
			method: 'POST',
			data,
		})) as TResponse;

		onResponse(response);

		createSuccessNotice(successMessage, { type: 'snackbar' });

		return response;
	}

	return { savePartial };
}
