/**
 * External Dependencies
 */
import styled from '@emotion/styled';

/**
 * WordPress Dependencies
 */
import { useState, useCallback } from '@wordpress/element';
import {
	Button,
	Placeholder as WPComPlaceholder,
	Spinner,
} from '@wordpress/components';

/**
 * Internal Dependencies
 */
import StyledComponentContext from '../styled-component-context';

const LoadingIndicator = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default function SyncedEntityPlaceholder({
	setAttributes,
	isNew,
	isResolving,
	label,
	instructions,
	icon,
	loadingLabel,
	createButtonLabel,
	disableCreation = false,
	renderSearch,
	renderCreateModal,
}) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const handleOpenCreate = useCallback(() => setIsCreateOpen(true), []);
	const handleCloseCreate = useCallback(() => setIsCreateOpen(false), []);
	const handleAfterCreate = useCallback(
		(postId) => {
			setAttributes({ ref: parseInt(postId, 10) });
		},
		[setAttributes]
	);

	const placeholderIcon = typeof icon === 'function' ? icon : icon;

	return (
		<StyledComponentContext cacheKey="prc-synced-entity-placeholder">
			<WPComPlaceholder
				instructions={instructions}
				label={label}
				icon={placeholderIcon}
			>
				<div style={{ width: '100%' }}>
					{!isNew && isResolving && (
						<LoadingIndicator>
							<span>{loadingLabel} </span>
							<Spinner />
						</LoadingIndicator>
					)}
					{isNew && (
						<>
							{typeof renderSearch === 'function' &&
								renderSearch()}
							{false === disableCreation && (
								<div style={{ marginTop: '1em' }}>
									<Button
										variant="primary"
										onClick={handleOpenCreate}
									>
										{createButtonLabel}
									</Button>
								</div>
							)}
							{typeof renderCreateModal === 'function'
								? renderCreateModal({
										isOpen: isCreateOpen,
										onOpen: handleOpenCreate,
										onClose: handleCloseCreate,
										afterCreate: handleAfterCreate,
									})
								: null}
						</>
					)}
				</div>
			</WPComPlaceholder>
		</StyledComponentContext>
	);
}
