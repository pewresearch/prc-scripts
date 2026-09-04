/**
 * WordPress Dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import {
	SearchControl,
	TabbableContainer,
	KeyboardShortcuts,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal Dependencies
 */
import SearchResults from './search-results';
import { ProvideWPEntitySearch } from './context';

const DEFAULT_ENTITY_STATUS = ['publish'];
const NOOP = () => {};

/**
 * A component to search for a post or stub by url or title
 * using the WordPress REST API and entities store.
 *
 * @param {Object}                    param0                   Component props.
 * @param {string}                    param0.placeholder       Placeholder for the search input.
 * @param {string}                    param0.searchValue       Pre-populated search input.
 * @param {Function}                  param0.onSelect          Called with the selected entity.
 * @param {Function}                  param0.onKeyEnter        Called when Enter is pressed.
 * @param {Function}                  param0.onKeyESC          Called when Escape is pressed.
 * @param {number}                    param0.entityId          Currently selected entity id.
 * @param {string}                    param0.entityType        Entity kind: postType, taxonomy, or user.
 * @param {string|string[]}           param0.entitySubType     Post type, taxonomy, or user subtype.
 * @param {string[]}                  param0.entityStatus      Post statuses to include.
 * @param {number}                    param0.perPage           Result page size.
 * @param {boolean}                   param0.hideChildren      Hide child posts from results.
 * @param {Function|boolean}          param0.onUpdateURL       Optional URL update handler.
 * @param {boolean}                   param0.clearOnSelect     Clear the search after select.
 * @param {Function|boolean}          param0.createNew         Optional create-new handler.
 * @param {boolean}                   param0.showExcerpt       Show excerpt in results.
 * @param {boolean}                   param0.showType          Show entity subtype in results.
 * @param {boolean}                   param0.showUrl           Show entity URL in results.
 * @param {boolean}                   param0.showFeaturedImage Show featured image in results.
 * @param {string}                    param0.searchSize        Search control size: default or large.
 * @param {string}                    param0.taxonomy          Optional taxonomy to scope post results.
 * @param {number}                    param0.termId            Optional term ID used with taxonomy.
 * @param {import('react').ReactNode} param0.children          Optional children.
 * @return {import('react').ReactElement} Search control and results.
 */
export default function WPEntitySearch({
	placeholder = 'Climate Change', // placeholder for the search input
	searchValue = '', // pre-populate the search input
	onSelect = NOOP,
	onKeyEnter = NOOP,
	onKeyESC = NOOP,
	entityId,
	entityType = 'postType', // taxonomy, user
	entitySubType = 'post', // ['post', 'page', 'staff'] || ['category', 'tag'] || 'user'
	entityStatus = DEFAULT_ENTITY_STATUS,
	perPage = 10,
	hideChildren = true,
	onUpdateURL = false,
	clearOnSelect = false,
	createNew = false,
	showExcerpt = false,
	showType = true,
	showUrl = true,
	showFeaturedImage = false,
	searchSize = 'default', // compact also available
	taxonomy = '',
	termId = 0,
	children,
}) {
	// Setup our search value first thing.
	const [searchInput, setSearchInput] = useState(searchValue);
	const searchControlSize = useMemo(() => {
		// Inverting the syntax to make it more readable.
		// For us you say searchControlSize="large" to get
		// the "default" otheriwse we default to "compact"
		return 'large' === searchSize ? 'default' : 'compact';
	}, [searchSize]);

	return (
		<TabbableContainer>
			<KeyboardShortcuts
				shortcuts={{
					esc: () => {
						if ('function' === typeof onKeyESC) {
							onKeyESC();
							setSearchInput('');
						}
					},
					enter: () => {
						if ('function' === typeof onKeyEnter) {
							onKeyEnter();
						}
					},
				}}
			>
				<VStack spacing="2">
					<SearchControl
						value={searchInput}
						onChange={(keyword) => setSearchInput(keyword)}
						placeholder={placeholder}
						autoComplete="off"
						size={searchControlSize}
					/>
					<ProvideWPEntitySearch
						{...{
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
						}}
					>
						<SearchResults />
					</ProvideWPEntitySearch>
				</VStack>
			</KeyboardShortcuts>
			<div
				className="wp-entity-search__children"
				style={{
					paddingTop: '0.5em',
				}}
			>
				{children}
			</div>
		</TabbableContainer>
	);
}
