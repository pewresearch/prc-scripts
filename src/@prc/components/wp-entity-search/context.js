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
	perPage,
	hideChildren,
	searchInput,
	setSearchInput,
	onSelect,
	clearOnSelect,
	createNew,
	showExcerpt,
	showType,
}) => {
	// Debounce the search input
	const searchString = useDebounce(searchInput, 750);
	// Loading state
	const [isLoading, setIsLoading] = useState(!!searchInput);
	// Selected entity id and records
	const [selectedId, setSelectedId] = useState(entityId);
	const [records, setRecords] = useState([]);

	const onClear = () => {
		setSearchInput('');
		setSelectedId(null);
		setRecords([]);
	};

	useEffect(() => {
		if (!searchString) {
			console.log('Nothing to search for');
			setIsLoading(false);
		} else if (searchString && entityType && entitySubType) {
			console.log(
				'Starting search...',
				searchString,
				entityType,
				entitySubType
			);
			setIsLoading(true);
			apiFetch({
				path: addQueryArgs(REST_ENDPOINT, {
					entity_type: entityType,
					entity_sub_type: entitySubType,
					search: searchString,
				}),
				method: 'GET',
			})
				.then((response) => {
					console.log('Search found...', response);
					setRecords(response);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('wpEntitySearchContext error', error);
					setIsLoading(false);
				});
		}
	}, [searchString, entityType, entitySubType]);

	// Once there is a selectedId and records...
	// This then handles the onSelect callback to pass the selected entity up to the parent component.
	useEffect(() => {
		console.log("update selectedId and records", selectedId, records);
		if (selectedId && records) {
			const entity = records.find(
				(record) => record.entityId === selectedId
			);
			if (entity) {
				console.log('Process OnSelect::', entity);
				onSelect(entity);
			}
			if (clearOnSelect) {
				onClear();
			}
		}
	}, [selectedId, records]);

	// Check if there are search records
	const hasSearchRecords = useMemo(() => {
		console.log('hasSearchRecords', records);
		console.log(!isLoading && records && records.length > 0);
		return (
			!isLoading && records && records.length > 0 && searchString !== ''
		);
	}, [isLoading, records, searchString]);
	// Check if nothing has been found
	const hasNothingFound = useMemo(
		() => !isLoading && !hasSearchRecords,
		[isLoading, hasSearchRecords]
	);

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
		createNew,
		showExcerpt,
		showType,
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
	perPage,
	hideChildren,
	searchInput,
	setSearchInput,
	onSelect,
	clearOnSelect,
	createNew,
	showExcerpt,
	showType,
	children,
}) {
	const provider = useWPEntitySearchContext({
		entityId,
		entityType,
		entitySubType,
		perPage,
		hideChildren,
		searchInput,
		setSearchInput,
		onSelect,
		clearOnSelect,
		createNew,
		showExcerpt,
		showType,
	});
	return (
		<wpEntitySearchContext.Provider value={provider}>
			{children}
		</wpEntitySearchContext.Provider>
	);
}

export { ProvideWPEntitySearch, useWPEntitySearch };
export default ProvideWPEntitySearch;
