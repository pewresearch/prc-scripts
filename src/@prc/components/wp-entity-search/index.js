/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/**
 * External Dependencies
 */
import { useDebounce } from '@prc/hooks';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, useState, useMemo, useEffect } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	CardMedia,
	SearchControl,
	Spinner,
	TabbableContainer,
	KeyboardShortcuts,
	Modal,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEntityRecords, useEntityProp } from '@wordpress/core-data';

/**
 * Internal Dependencies
 */
import List from './search-results/List';

/**
 * A component to search for a post or stub by url or title
 * using the WordPress REST API and entities store.
 *
 * @param {*} param0
 * @return
 */
export default function WPEntitySearch({
	placeholder = "Climate Change",
	searchLabel = __('Search'),
	searchValue = '',
	entityId = null,
	entityType = 'postType', // postType, taxonomy, user
	entitySubType = 'post', // post, page, stub, category, tag, user
	onSelect = () => {},
	onKeyEnter = () => {},
	onKeyESC = () => {},
	perPage = 10,
	showExcerpt = false,
	children,
}) {
	const [siteId] = useEntityProp('root', 'site', 'siteId');

	const [isLoading, toggleLoading] = useState(!!searchValue);
	const [searchInput, setSearchInput] = useState(searchValue);
	const searchString = useDebounce(searchInput, 500);
	const searchStringIsUrl = useMemo(() => {
		if (
			undefined !== searchString &&
			searchString.match(/^(http|https):\/\//)
		) {
			return true;
		}
		return false;
	}, [searchString]);
	const hasSearchString = !!searchString.length;

	const entityArgs = useMemo(() => {
		const args = {
			per_page: perPage,
			search:
				!!searchString.length && !searchStringIsUrl ? searchString : '',
			context: 'view',
		};
		if (entityId) {
			args.include = [entityId]; // explicitly include the current entity
		}
		if ('postType' === entityType) {
			args.post_parent = 0; // exclude child posts
		}
		return args;
	}, [entityId, entityType, perPage, searchString, searchStringIsUrl]);

	const { records: searchRecords, isResolving } = useEntityRecords(
		entityType,
		entitySubType,
		entityArgs
	);
	const hasSearchRecords =
		!isLoading && searchRecords ? 0 < searchRecords.length : false;
	const hasNothingFound = !isLoading && !hasSearchRecords;

	useEffect(() => {
		toggleLoading(isResolving);
	}, [isResolving]);

	return (
		<TabbableContainer
			onNavigate={(index, elm) => console.log('onNavigate:', elm)}
		>
			<KeyboardShortcuts
				shortcuts={{
					esc: () => {
						if ('function' === typeof onKeyESC) {
							onKeyESC();
						}
					},
					enter: () => {
						if ('function' === typeof onKeyEnter) {
							onKeyEnter();
						}
					},
				}}
			>
				<SearchControl
					value={searchInput}
					onChange={(keyword) => setSearchInput(keyword)}
					placeholder={placeholder}
					autoComplete="off"
				/>
			</KeyboardShortcuts>
			{hasSearchString && (
				<Fragment>
					{isLoading && (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								color: '#666',
							}}
						>
							<span>Loading... </span>
							<Spinner />
						</div>
					)}

					{hasNothingFound && (
						<div
							style={{
								textAlign: 'center',
								color: '#666',
								paddingTop: '1em',
							}}
						>
							<div
								style={{
									padding: '1em 0',
								}}
							>
								<span>
									{__('Nothing found.', 'prc-block-library')}
								</span>
							</div>
						</div>
					)}

					{hasSearchRecords && (
						<List
							{...{
								searchRecords,
								onSelect,
								entityType,
								showExcerpt,
								entityId,
							}}
						/>
					)}
				</Fragment>
			)}
			{children}
		</TabbableContainer>
	);
}
