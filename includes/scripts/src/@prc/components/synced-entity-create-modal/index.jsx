/**
 * WordPress Dependencies
 */
import { useState, useCallback } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexItem,
	Modal,
	Notice,
	Spinner,
	TextControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { plus } from '@wordpress/icons';

export default function SyncedEntityCreateModal({
	isOpen,
	onOpen,
	onClose,
	hideTrigger = false,
	title,
	description,
	textControlLabel,
	textPlaceholder = '',
	createButtonLabel,
	creatingLabel,
	cancelLabel = 'Cancel',
	triggerLabel,
	createRecord,
	afterCreate,
	canSubmit,
	renderFields,
	openInNewTab = true,
	getCreateErrorMessage,
}) {
	const [entityTitle, setEntityTitle] = useState('');
	const [extras, setExtras] = useState({});
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState(null);
	const { createErrorNotice } = useDispatch(noticesStore);

	const handleClose = useCallback(() => {
		setEntityTitle('');
		setExtras({});
		setError(null);
		setIsCreating(false);
		onClose();
	}, [onClose]);

	const handleCreate = useCallback(async () => {
		if (!canSubmit({ title: entityTitle, extras })) {
			return;
		}

		setIsCreating(true);
		setError(null);

		try {
			const postId = await createRecord(entityTitle.trim(), extras);

			if (!postId) {
				throw new Error(
					getCreateErrorMessage?.() || 'Could not create the entity.'
				);
			}

			const parsedPostId = parseInt(postId, 10);

			if (afterCreate) {
				await afterCreate(parsedPostId);
			}

			if (openInNewTab) {
				window.open(
					addQueryArgs('post.php', {
						post: parsedPostId,
						action: 'edit',
					}),
					'_blank'
				);
			}

			handleClose();
		} catch (err) {
			const message =
				err?.message ||
				getCreateErrorMessage?.() ||
				'Could not create the entity.';
			setError(message);
			createErrorNotice(message, { type: 'snackbar' });
			setIsCreating(false);
		}
	}, [
		entityTitle,
		extras,
		canSubmit,
		createRecord,
		afterCreate,
		openInNewTab,
		handleClose,
		createErrorNotice,
		getCreateErrorMessage,
	]);

	const submitEnabled =
		canSubmit({ title: entityTitle, extras }) && !isCreating;

	return (
		<>
			{!hideTrigger && (
				<Button
					variant="primary"
					onClick={onOpen}
					icon={plus}
					__next40pxDefaultSize
				>
					{triggerLabel || createButtonLabel}
				</Button>
			)}

			{isOpen && (
				<Modal title={title} onRequestClose={handleClose} size="medium">
					{description && <p>{description}</p>}

					{error && (
						<Notice status="error" isDismissible={false}>
							{error}
						</Notice>
					)}

					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={textControlLabel}
						value={entityTitle}
						onChange={setEntityTitle}
						placeholder={textPlaceholder}
						disabled={isCreating}
					/>

					{renderFields?.({
						disabled: isCreating,
						title: entityTitle,
						extras,
						setExtras,
					})}

					<Flex
						justify="flex-start"
						gap={3}
						style={{ marginTop: '16px' }}
					>
						<FlexItem>
							<Button
								variant="primary"
								onClick={handleCreate}
								disabled={!submitEnabled}
								icon={isCreating ? null : plus}
							>
								{isCreating ? (
									<Flex gap={2}>
										<Spinner />
										{creatingLabel}
									</Flex>
								) : (
									createButtonLabel
								)}
							</Button>
						</FlexItem>
						<FlexItem>
							<Button
								variant="secondary"
								onClick={handleClose}
								disabled={isCreating}
							>
								{cancelLabel}
							</Button>
						</FlexItem>
					</Flex>
				</Modal>
			)}
		</>
	);
}
