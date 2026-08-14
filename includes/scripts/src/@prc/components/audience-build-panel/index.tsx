import {
	Button,
	Card,
	CardBody,
	Notice,
	SelectControl,
	Spinner,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalConfirmDialog as ConfirmDialog,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import type {
	AudienceBuildPanelProps,
	AudienceSnapshot,
	VerificationMode,
} from './types';

const VERIFICATION_OPTIONS = [
	{
		label: __('Verified', 'prc-platform-core'),
		value: 'verified',
	},
	{
		label: __('Unverified', 'prc-platform-core'),
		value: 'unverified',
	},
	{
		label: __('All recipients', 'prc-platform-core'),
		value: 'all',
	},
] satisfies { label: string; value: VerificationMode }[];

function isVerificationMode(value: string): value is VerificationMode {
	return value === 'verified' || value === 'unverified' || value === 'all';
}

function getVerificationLabel(verification: VerificationMode): string {
	switch (verification) {
		case 'verified':
			return __('Verified', 'prc-platform-core');
		case 'unverified':
			return __('Unverified', 'prc-platform-core');
		case 'all':
			return __('All recipients', 'prc-platform-core');
		default: {
			const exhaustive: never = verification;
			return exhaustive;
		}
	}
}

function getAudienceMetadata(
	audience: AudienceSnapshot
): { label: string; value: string }[] {
	const metadata: { label: string; value: string }[] = [
		{
			label: __('Recipients', 'prc-platform-core'),
			value: audience.count.toLocaleString(),
		},
		{
			label: __('Verification', 'prc-platform-core'),
			value: getVerificationLabel(audience.verification),
		},
		{
			label: __('Built', 'prc-platform-core'),
			value: audience.builtAt || __('Not available', 'prc-platform-core'),
		},
		{
			label: __('Key', 'prc-platform-core'),
			value: audience.key,
		},
	];

	if (audience.stats?.scanned !== undefined) {
		metadata.push({
			label: __('Scanned', 'prc-platform-core'),
			value: audience.stats.scanned.toLocaleString(),
		});
	}
	if (audience.stats?.matched !== undefined) {
		metadata.push({
			label: __('Matched', 'prc-platform-core'),
			value: audience.stats.matched.toLocaleString(),
		});
	}
	if (audience.stats?.v2Groups !== undefined) {
		metadata.push({
			label: __('V2 groups', 'prc-platform-core'),
			value: audience.stats.v2Groups.toLocaleString(),
		});
	}

	return metadata;
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
	onBuild,
	onRebuild,
	onDelete,
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
		disabled || status === 'building' || status === 'deleting';

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
					{status === 'building' && (
						<div
							className="prc-audience-build-panel__status"
							role="status"
						>
							<Spinner />
							<span>
								{__(
									'Building audience… this can take several minutes.',
									'prc-platform-core'
								)}
							</span>
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
							options={VERIFICATION_OPTIONS}
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
								<Card key={audience.key}>
									<CardBody>
										<strong>{audience.label}</strong>
										<dl className="prc-audience-build-panel__meta">
											{getAudienceMetadata(audience).map(
												({ label, value }) => (
													<div key={label}>
														<dt>{label}</dt>
														<dd>{value}</dd>
													</div>
												)
											)}
										</dl>

										{audience.verification ===
											verification && (
											<div className="prc-audience-build-panel__actions">
												<Button
													variant="secondary"
													disabled={actionsDisabled}
													onClick={() =>
														onRebuild({
															verification:
																audience.verification,
														})
													}
												>
													{__(
														'Rebuild',
														'prc-platform-core'
													)}
												</Button>
												<Button
													variant="tertiary"
													isDestructive
													disabled={actionsDisabled}
													onClick={() =>
														setDeleteTarget(
															audience
														)
													}
												>
													{__(
														'Delete',
														'prc-platform-core'
													)}
												</Button>
											</div>
										)}
									</CardBody>
								</Card>
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
