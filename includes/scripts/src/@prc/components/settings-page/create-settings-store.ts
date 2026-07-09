import { createReduxStore, register } from '@wordpress/data';

import { setValueByPath } from './settings-field-utils';
import type {
	CreateSettingsStoreConfig,
	SettingsApiResponse,
	SettingsStoreState,
} from './types';

const SET_FROM_RESPONSE = 'SET_FROM_RESPONSE';
const APPLY_PATCH = 'APPLY_PATCH';

export function createSettingsStore<
	TSettings,
	TState extends SettingsStoreState<TSettings>,
	TResponse extends SettingsApiResponse<TSettings> =
		SettingsApiResponse<TSettings>,
>(config: CreateSettingsStoreConfig<TSettings, TState, TResponse>) {
	const {
		name,
		defaultState,
		getSettingsFromResponse,
		mapResponseToState,
		extraActions = {},
		extraReducer,
		extraSelectors = {},
	} = config;

	const baseActions = {
		setFromResponse(response: TResponse) {
			return {
				type: SET_FROM_RESPONSE,
				payload: response,
			};
		},
		applyPatch(patch: Record<string, unknown>) {
			return {
				type: APPLY_PATCH,
				patch,
			};
		},
		...extraActions,
	};

	type BaseAction = ReturnType<typeof baseActions.setFromResponse>;
	type ExtraAction = ReturnType<
		(typeof extraActions)[keyof typeof extraActions]
	>;
	type Action = BaseAction | ExtraAction;

	const reducer = (state: TState = defaultState, action: Action): TState => {
		if (action.type === APPLY_PATCH) {
			let nextSettings = state.settings as Record<string, unknown>;

			for (const [path, value] of Object.entries(
				action.patch as Record<string, unknown>
			)) {
				nextSettings = setValueByPath(nextSettings, path, value);
			}

			return {
				...state,
				settings: nextSettings as TSettings,
			};
		}

		if (action.type === SET_FROM_RESPONSE) {
			const response = action.payload as TResponse;
			const settings = getSettingsFromResponse
				? getSettingsFromResponse(response)
				: response.settings;
			const nextState = {
				...state,
				settings,
				isLoaded: true,
			} as TState;

			if (mapResponseToState) {
				return {
					...nextState,
					...mapResponseToState(nextState, response),
				};
			}

			return nextState;
		}

		if (extraReducer) {
			const result = extraReducer(state, action);
			if (result !== null) {
				return result;
			}
		}

		return state;
	};

	const baseSelectors = {
		getSettings(s: TState): TSettings {
			return s.settings;
		},
		isLoaded(s: TState): boolean {
			return s.isLoaded;
		},
		...extraSelectors,
	};

	const store = createReduxStore(name, {
		reducer,
		actions: baseActions,
		selectors: baseSelectors,
	});

	register(store);

	return store;
}
