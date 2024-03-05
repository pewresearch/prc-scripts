/* eslint-disable @wordpress/no-unsafe-wp-apis */
/* @wordpress/sync ready */
/**
 * WordPress Dependencies
 */
import { useMemo, useEffect } from 'react';
import { useEntityBlockEditor, useEntityRecord } from '@wordpress/core-data';
import {
	useInnerBlocksProps,
	RecursionProvider,
	useHasRecursion,
	InnerBlocks,
	Warning,
} from '@wordpress/block-editor';

/**
 * Internal Dependencies
 */
import DetachBlocksToolbarControl from '../detach-blocks-toolbar-control';
import LoadingIndicator from '../loading-indicator';

/**
 * A version of InnerBlocks that will render the blocks from a post type given a postId and postType. Any changes to inner blocks will be saved back to the post type.
 *
 * This component supports @wordpress/sync for real-time multi-user editing.
 *
 * @param {Object}   props
 * @param {number}   props.postId            - the id of the entity.
 * @param {string}   props.postType          - the post type of the entity.
 * @param {string}   props.postTypeLabel     - the label of the post type.
 * @param {Object}   props.blockProps        - the props of the block.
 * @param {string}   props.clientId          - the client id of the block.
 * @param {boolean}  props.allowDetach       - whether or not to allow the user to detach the blocks from the entity.
 * @param {Function} props.isMissingChildren - a function that will be called when the record is missing, useful for passing a component to render when the record is missing.
 * @param {Function} props.collector         - a function that will be called when the record changes, useful for passing information about the entitty to a higher level component.
 * @param {any}      props.children
 * @return
 */
export default function InnerBlocksAsSyncedContent({
	postId,
	postType = 'post',
	postTypeLabel = '',
	blockProps = {},
	clientId,
	allowDetach = false,
	isMissingChildren,
	collector,
	children,
}) {
	const { record, isResolving, hasResolved } = useEntityRecord(
		'postType',
		postType,
		postId
	);
	const [blocks, onInput, onChange] = useEntityBlockEditor(
		'postType',
		postType,
		{ id: postId }
	);

	const isMissing =
		true === hasResolved && false === isResolving && undefined === record;

	const recursionKey = useMemo(() => {
		return JSON.stringify(postId, postType);
	}, [postId]);

	// Provides an entry point so that when record change a collector function higher up can pass it along where it needs to.
	useEffect(() => {
		// check if collector is a function
		if (typeof collector !== 'function') {
			return;
		}
		collector(record);
	}, [record, collector]);

	const hasAlreadyRendered = useHasRecursion(recursionKey);

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		value: blocks,
		onInput,
		onChange,
		renderAppender: blocks?.length
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	});

	useEffect(() => {
		console.log('InnerBlocksAsSyncedContent', {
			isResolving,
			hasResolved,
			record,
			isMissing,
		});
	}, [isResolving, isMissing, hasResolved, record]);

	if (hasAlreadyRendered) {
		return (
			<div {...blockProps}>
				<Warning>
					{`${postTypeLabel} cannot be rendered inside itself.`}
				</Warning>
			</div>
		);
	}

	if (isResolving || !hasResolved) {
		return (
			<div {...blockProps}>
				<Warning>
					<LoadingIndicator
						enabled={true}
						label={`Loading ${postTypeLabel} …`}
					/>
				</Warning>
			</div>
		);
	}

	if (isMissing) {
		return (
			<div {...blockProps}>
				<Warning>
					{`A matching ${postTypeLabel.toLocaleLowerCase()} could not be found. It may be unavailable at this time.`}
					{isMissingChildren && (
						<div style={{ marginTop: '1em' }}>
							{isMissingChildren()}
						</div>
					)}
				</Warning>
			</div>
		);
	}

	return (
		<RecursionProvider uniqueId={recursionKey}>
			<div {...innerBlocksProps} />
			{allowDetach && (
				<DetachBlocksToolbarControl
					{...{
						blocks,
						clientId,
						label: `Detach %s blocks from ${postTypeLabel}`,
					}}
				/>
			)}
			{children}
		</RecursionProvider>
	);
}
