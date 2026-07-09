/**
 * WordPress Dependencies
 */
import {
	useMemo,
	useCallback,
	useEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { useResizeObserver } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { parse } from '@wordpress/blocks';
import { useHasRecursion } from '@wordpress/block-editor';

/**
 * Internal Dependencies
 */
import { entityRecordArgs, formatPresenceNoticeMessage } from '@prc/functions';
import useEntityPresence from './use-entity-presence';
import useSyncedEntityRefresh from './use-synced-entity-refresh';

const DEFAULT_PREVIEW_WIDTH = 1200;

function isShrinkWrappedAlign(align) {
	return align === 'left' || align === 'right' || align === 'center';
}

// Keeps the last successful BlockPreview across cache invalidation so tab
// refocus / presence polling refresh quietly (same pattern as synced-chart).
export default function useSyncedEntityPreviewEdit({
	postType,
	ref,
	align,
	presenceMessages,
	presenceDebug = false,
	resolveEffectiveRef,
	getShrinkWrapWidth,
}) {
	const isNew = !ref;
	const [hasLoadedPreview, setHasLoadedPreview] = useState(false);
	const lastBlocksRef = useRef([]);
	const lastContentRawRef = useRef('');
	const lastParsedBlocksRef = useRef([]);
	const lastPreviewWidthRef = useRef(0);

	const { baseRecord, baseHasResolved } = useSelect(
		(select) => {
			if (!ref) {
				return { baseRecord: undefined, baseHasResolved: false };
			}
			const args = entityRecordArgs(postType, ref);
			return {
				baseRecord: select(coreStore).getEntityRecord(...args),
				baseHasResolved: select(coreStore).hasFinishedResolution(
					'getEntityRecord',
					args
				),
			};
		},
		[postType, ref]
	);

	const effectiveRef = useMemo(() => {
		if (!ref) {
			return ref;
		}
		const forkRef = resolveEffectiveRef?.(baseRecord);
		return forkRef || ref;
	}, [ref, baseRecord, resolveEffectiveRef]);

	const isForkActive = !!ref && effectiveRef !== ref;

	const { effectiveRecord, effectiveHasResolved } = useSelect(
		(select) => {
			if (!effectiveRef) {
				return {
					effectiveRecord: undefined,
					effectiveHasResolved: false,
				};
			}

			if (!isForkActive) {
				return {
					effectiveRecord: baseRecord,
					effectiveHasResolved: baseHasResolved,
				};
			}

			const args = entityRecordArgs(postType, effectiveRef);

			return {
				effectiveRecord: select(coreStore).getEntityRecord(...args),
				effectiveHasResolved: select(coreStore).hasFinishedResolution(
					'getEntityRecord',
					args
				),
			};
		},
		[postType, effectiveRef, isForkActive, baseRecord, baseHasResolved]
	);

	const canEdit = useSelect(
		(select) => {
			if (!effectiveRef) {
				return undefined;
			}
			return select(coreStore).canUser('update', {
				kind: 'postType',
				name: postType,
				id: effectiveRef,
			});
		},
		[postType, effectiveRef]
	);

	const { isBeingEdited, editors, isOccupied } = useEntityPresence(
		postType,
		effectiveRef,
		{ debug: presenceDebug }
	);

	const { invalidateResolution } = useDispatch(coreStore);

	const invalidate = useCallback(() => {
		if (!ref) {
			return;
		}
		invalidateResolution(
			'getEntityRecord',
			entityRecordArgs(postType, ref)
		);
		if (effectiveRef && effectiveRef !== ref) {
			invalidateResolution(
				'getEntityRecord',
				entityRecordArgs(postType, effectiveRef)
			);
		}
	}, [postType, ref, effectiveRef, invalidateResolution]);

	useSyncedEntityRefresh({
		enabled: !!ref,
		isOccupied,
		invalidate,
	});

	useEffect(() => {
		if (effectiveHasResolved && effectiveRecord) {
			setHasLoadedPreview(true);
		}
	}, [effectiveHasResolved, effectiveRecord]);

	useEffect(() => {
		setHasLoadedPreview(false);
		lastBlocksRef.current = [];
		lastContentRawRef.current = '';
		lastParsedBlocksRef.current = [];
		lastPreviewWidthRef.current = 0;
	}, [ref, effectiveRef]);

	const hasAlreadyRendered = useHasRecursion(effectiveRef);

	const parsedBlocks = useMemo(() => {
		const raw = effectiveRecord?.content?.raw;
		if (!raw) {
			return [];
		}
		if (
			raw === lastContentRawRef.current &&
			lastParsedBlocksRef.current.length
		) {
			return lastParsedBlocksRef.current;
		}
		const nextBlocks = parse(raw, { __unstableSkipMigrationLogs: true });
		lastContentRawRef.current = raw;
		lastParsedBlocksRef.current = nextBlocks;
		return nextBlocks;
	}, [effectiveRecord?.content?.raw]);

	useEffect(() => {
		if (parsedBlocks.length) {
			lastBlocksRef.current = parsedBlocks;
		}
	}, [parsedBlocks]);

	const blocks =
		parsedBlocks.length > 0 ? parsedBlocks : lastBlocksRef.current;

	const [previewResizeListener, { width: previewWidth }] =
		useResizeObserver();

	useEffect(() => {
		if (previewWidth) {
			lastPreviewWidthRef.current = previewWidth;
		}
	}, [previewWidth]);

	const isShrinkWrapped = isShrinkWrappedAlign(align);

	const measuredPreviewWidth =
		previewWidth || lastPreviewWidthRef.current || DEFAULT_PREVIEW_WIDTH;

	const stablePreviewWidth = Math.round(
		isShrinkWrapped && getShrinkWrapWidth
			? getShrinkWrapWidth(blocks) || measuredPreviewWidth
			: measuredPreviewWidth
	);

	const entityTitle =
		baseRecord?.title?.raw ||
		baseRecord?.title?.rendered ||
		effectiveRecord?.title?.raw ||
		effectiveRecord?.title?.rendered ||
		'';

	const permalink = effectiveRecord?.link || baseRecord?.link || '';

	const presenceMessage = useMemo(
		() => formatPresenceNoticeMessage(editors, presenceMessages),
		[editors, presenceMessages]
	);

	const allResolved = isForkActive
		? baseHasResolved && effectiveHasResolved
		: baseHasResolved;

	const isInitialResolving = !isNew && !hasLoadedPreview && !allResolved;

	const isBaseMissing =
		baseHasResolved && !baseRecord && !isNew && !hasLoadedPreview;

	const isEffectiveMissing =
		effectiveHasResolved &&
		!effectiveRecord &&
		!isNew &&
		!hasLoadedPreview &&
		!!baseRecord;

	const isMissing = isBaseMissing || isEffectiveMissing;

	return {
		isNew,
		isMissing,
		isInitialResolving,
		hasResolved: allResolved,
		hasLoadedPreview,
		record: effectiveRecord,
		baseRecord,
		blocks,
		hasAlreadyRendered,
		previewResizeListener,
		previewWidth,
		stablePreviewWidth,
		isShrinkWrapped,
		entityTitle,
		permalink,
		isBeingEdited,
		presenceMessage,
		effectiveRef,
		isForkActive,
		canEdit,
		invalidate,
	};
}
