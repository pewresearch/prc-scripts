import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	DropdownMenu,
	MenuItem,
	Notice,
	SelectControl,
	Spinner,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- ConfirmDialog is the standard destructive confirm pattern in WP packages.
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

import {
	AUDIENCE_FORM,
	VERIFICATION_LABELS,
	getAudienceFields,
} from './fields';
import type {
	AudienceBuildPanelProps,
	AudienceSnapshot,
	VerificationMode,
} from './types';
import { isAudienceJobInFlight } from './types';

import './style.scss';

function isVerificationMode(value: string): value is VerificationMode {
	return value === 'verified' || value === 'unverified' || value === 'all';
}

type AudienceCardProps = {
	audience: AudienceSnapshot;
	actionsDisabled: boolean;
	onRebuild: AudienceBuildPanelProps['onRebuild'];
	onDeleteRequest: (audience: AudienceSnapshot) => void;
	onCreateDraft?: AudienceBuildPanelProps['onCreateDraft'];
};

function AudienceCard({
	audience,
	actionsDisabled,
	onRebuild,
	onDeleteRequest,
	onCreateDraft,
}: AudienceCardProps) {
	return (
		<Card className="prc-audience-build-panel__card">
			<CardHeader>
				<strong>{audience.label}</strong>
			</CardHeader>
			<CardBody>
				<DataForm
					data={audience}
					fields={getAudienceFields()}
					form={AUDIENCE_FORM}
					onChange={() => {}}
				/>
			</CardBody>
			<CardFooter>
				<Button
					__next40pxDefaultSize
					variant="secondary"
					disabled={actionsDisabled}
					onClick={() =>
						onRebuild({ verification: audience.verification })
					}
					aria-label={sprintf(
						/* translators: %s: verification label */
						__('Update %s audience', 'prc-platform-core'),
						VERIFICATION_LABELS[audience.verification]
					)}
				>
					{__('Update', 'prc-platform-core')}
				</Button>
				<DropdownMenu
					icon={moreVertical}
					label={__('More actions', 'prc-platform-core')}
					toggleProps={{
						disabled: actionsDisabled,
						__next40pxDefaultSize: true,
					}}
				>
					{({ onClose }) => (
						<>
							{onCreateDraft ? (
								<MenuItem
									onClick={() => {
										onCreateDraft({
											verification: audience.verification,
											key: audience.key,
										});
										onClose();
									}}
								>
									{__(
										'Create email draft',
										'prc-platform-core'
									)}
								</MenuItem>
							) : null}
							<MenuItem
								isDestructive
								onClick={() => {
									onDeleteRequest(audience);
									onClose();
								}}
							>
								{__('Delete', 'prc-platform-core')}
							</MenuItem>
						</>
					)}
				</DropdownMenu>
			</CardFooter>
		</Card>
	);
}

export default function AudienceBuildPanel({
	title,
	helpText,
	audiences,
	status,
	errorMessage,
	defaultVerification = 'verified',
	referencingPostIds = [],
	disabled = false,
	disabledHelpText,
	jobStats,
	onBuild,
	onRebuild,
	onDelete,
	onCreateDraft,
}: AudienceBuildPanelProps) {
	const [verification, setVerification] =
		useState<VerificationMode>(defaultVerification);
	const [deleteTarget, setDeleteTarget] = useState<AudienceSnapshot | null>(
		null
	);
	const selectedAudience = audiences.find(
		(audience) => audience.verification === verification
	);
	const actionsDisabled =
		disabled ||
		status === 'queued' ||
		status === 'scanning' ||
		status === 'building' ||
		status === 'deleting' ||
		status === 'creating-draft';

	return (
		<div className="prc-audience-build-panel">
			{title && <h3>{title}</h3>}
			{helpText && (
				<p className="components-base-control__help">{helpText}</p>
			)}

			{status === 'loading' ? (
				<div className="prc-audience-build-panel__status" role="status">
					<Spinner />
					<span>{__('Loading…', 'prc-platform-core')}</span>
				</div>
			) : (
				<>
					{isAudienceJobInFlight(status) && (
						<div
							className="prc-audience-build-panel__status"
							role="status"
						>
							<Spinner />
							<span>
								{status === 'queued'
									? __(
											'Queued… you can leave this screen. The list appears when the build finishes.',
											'prc-platform-core'
										)
									: __(
											'Scanning Firebase users… this can take several minutes. You can leave this screen.',
											'prc-platform-core'
										)}
							</span>
							{typeof jobStats?.scanned === 'number' ? (
								<span>
									{sprintf(
										/* translators: %s: number of scanned users or groups */
										__(
											'Scanned %s so far.',
											'prc-platform-core'
										),
										jobStats.scanned.toLocaleString()
									)}
								</span>
							) : null}
						</div>
					)}

					{status === 'deleting' && (
						<div
							className="prc-audience-build-panel__status"
							role="status"
						>
							<Spinner />
							<span>
								{__('Deleting audience…', 'prc-platform-core')}
							</span>
						</div>
					)}

					{status === 'creating-draft' && (
						<div
							className="prc-audience-build-panel__status"
							role="status"
						>
							<Spinner />
							<span>
								{__(
									'Creating email draft…',
									'prc-platform-core'
								)}
							</span>
						</div>
					)}

					{status === 'error' && (
						<Notice status="error" isDismissible={false}>
							{errorMessage ||
								__(
									'The audience request failed.',
									'prc-platform-core'
								)}
						</Notice>
					)}

					{disabled && disabledHelpText && (
						<Notice status="info" isDismissible={false}>
							{disabledHelpText}
						</Notice>
					)}

					<VStack spacing={3}>
						<SelectControl
							label={__('Verification', 'prc-platform-core')}
							value={verification}
							options={Object.entries(VERIFICATION_LABELS).map(
								([value, label]) => ({
									value,
									label,
								})
							)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={(value) => {
								if (isVerificationMode(value)) {
									setVerification(value);
								}
							}}
						/>

						{!selectedAudience && (
							<Button
								__next40pxDefaultSize
								variant="primary"
								disabled={actionsDisabled}
								onClick={() => onBuild({ verification })}
							>
								{__('Generate Audience', 'prc-platform-core')}
							</Button>
						)}
					</VStack>

					{audiences.length > 0 && (
						<div className="prc-audience-build-panel__audiences">
							<h4>
								{__('Built audiences', 'prc-platform-core')}
							</h4>
							{audiences.map((audience) => (
								<AudienceCard
									key={audience.key}
									audience={audience}
									actionsDisabled={actionsDisabled}
									onRebuild={onRebuild}
									onDeleteRequest={setDeleteTarget}
									onCreateDraft={onCreateDraft}
								/>
							))}
						</div>
					)}

					{deleteTarget && (
						<ConfirmDialog
							onConfirm={() => {
								onDelete({
									verification: deleteTarget.verification,
									key: deleteTarget.key,
								});
								setDeleteTarget(null);
							}}
							onCancel={() => setDeleteTarget(null)}
						>
							{(deleteTarget.referencingPostIds?.length ?? 0) >
								0 || referencingPostIds.length > 0
								? __(
										'This audience is used by one or more posts. Delete it anyway? This cannot be undone.',
										'prc-platform-core'
									)
								: __(
										'Delete this audience? This cannot be undone.',
										'prc-platform-core'
									)}
						</ConfirmDialog>
					)}
				</>
			)}
		</div>
	);
}

export type {
	AudienceBuildPanelProps,
	AudiencePanelStatus,
	AudienceSnapshot,
	VerificationMode,
} from './types';
export { isAudienceJobInFlight } from './types';
