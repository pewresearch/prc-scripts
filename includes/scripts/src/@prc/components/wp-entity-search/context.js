/**
 * External Dependencies
 */
import { useDebounce } from '@prc/hooks';

/**
 * WordPress Dependencies
 */
import {
	useEffect,
	useState,
	useContext,
	createContext,
	useMemo,
	useCallback,
} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal Dependencies
 */

const REST_ENDPOINT = '/prc-api/v3/components/wp-entity-search/';

const wpEntitySearchContext = createContext();

const useWPEntitySearchContext = ({
	entityId,
	entityType,
	entitySubType,
	entityStatus = ['publish'],
	perPage,
	hideChildren,
	searchInput,
	setSearchInput,
	onUpdateURL,
	onSelect,
	clearOnSelect,
	createNew,
	showExcerpt,
	showType,
	showUrl,
	showFeaturedImage,
	taxonomy = '',
	termId = 0,
}) => {
	// Debounce the search input
	const searchString = useDebounce(searchInput, 750);
	// Loading state
	const [isLoading, setIsLoading] = useState(!!searchInput);
	// Selected entity id and records
	const [selectedId, setSelectedId] = useState(entityId);
	const [records, setRecords] = useState([]);

	const onClear = useCallback(() => {
		setSearchInput('');
		setSelectedId(null);
		setRecords([]);
	}, [setSearchInput]);

	const _onUpdateURL = () => {
		// check if onUpdateURL is a function
		if (typeof onUpdateURL === 'function') {
			onUpdateURL(searchString);
		}
	};

	// Consumers often pass inline arrays (`entityStatus={['publish']}`). Those
	// get a new reference on every parent render (e.g. after onSelect →
	// setAttributes), which would re-fire this effect and look like an endless
	// "searching" loop. Stabilize by value before depending on them.
	const entitySubTypeKey = useMemo(
		() =>
			Array.isArray(entitySubType)
				? entitySubType.join(',')
				: String(entitySubType ?? ''),
		[entitySubType]
	);
	const entityStatusKey = useMemo(
		() =>
			Array.isArray(entityStatus)
				? entityStatus.join(',')
				: String(entityStatus ?? ''),
		[entityStatus]
	);

	useEffect(() => {
		if (!searchString) {
			setIsLoading(false);
			return;
		}
		if (!entityType || !entitySubTypeKey) {
			return;
		}

		const subTypes = entitySubTypeKey.split(',').filter(Boolean);
		const statuses = entityStatusKey.split(',').filter(Boolean);

		const queryArgs = {
			entity_type: entityType,
			entity_sub_type: subTypes,
			search: searchString,
			entity_status: statuses,
		};
		if (taxonomy && Number(termId) > 0) {
			queryArgs.taxonomy = taxonomy;
			queryArgs.term_id = Number(termId);
		}

		setIsLoading(true);
		apiFetch({
			path: addQueryArgs(REST_ENDPOINT, queryArgs),
			method: 'GET',
		})
			.then((response) => {
				setRecords(response);
				setIsLoading(false);
			})
			.catch(() => {
				setIsLoading(false);
			});
	}, [
		searchString,
		entityType,
		entitySubTypeKey,
		entityStatusKey,
		taxonomy,
		termId,
	]);

	// Selection / onSelect is invoked from SearchItem onClick with the row `item` so parents always
	// receive the entity (avoids records.find strict equality failures and timing gaps).

	// Check if there are search records
	const hasSearchRecords = useMemo(() => {
		return (
			!isLoading && records && records.length > 0 && searchString !== ''
		);
	}, [isLoading, records, searchString]);
	// Check if nothing has been found
	const hasNothingFound = useMemo(
		() => !isLoading && !hasSearchRecords,
		[isLoading, hasSearchRecords]
	);

	const hasMultipleSubTypes =
		Array.isArray(entitySubType) && entitySubType.length > 1;

	return {
		entityConfig: {
			entityType,
			entitySubType,
		},
		perPage,
		hideChildren,
		searchString,
		setSearchInput,
		onSelect,
		onClear,
		clearOnSelect,
		onUpdateURL: typeof onUpdateURL === 'function' ? _onUpdateURL : false,
		createNew,
		showExcerpt,
		showType: showType && hasMultipleSubTypes,
		showUrl,
		showFeaturedImage,
		selectedId,
		setSelectedId,
		records,
		isLoading,
		hasSearchRecords,
		hasNothingFound,
	};
};

const useWPEntitySearch = () => useContext(wpEntitySearchContext);

function ProvideWPEntitySearch({
	entityId,
	entityType,
	entitySubType,
	entityStatus,
	perPage,
	hideChildren,
	searchInput,
	setSearchInput,
	onUpdateURL,
	onSelect,
	clearOnSelect,
	createNew,
	showExcerpt,
	showType,
	showUrl,
	showFeaturedImage,
	taxonomy,
	termId,
	children,
}) {
	const provider = useWPEntitySearchContext({
		entityId,
		entityType,
		entitySubType,
		entityStatus,
		perPage,
		hideChildren,
		searchInput,
		setSearchInput,
		onUpdateURL,
		onSelect,
		clearOnSelect,
		createNew,
		showExcerpt,
		showType,
		showUrl,
		showFeaturedImage,
		taxonomy,
		termId,
	});
	return (
		<wpEntitySearchContext.Provider value={provider}>
			{children}
		</wpEntitySearchContext.Provider>
	);
}

export { ProvideWPEntitySearch, useWPEntitySearch };
export default ProvideWPEntitySearch;
