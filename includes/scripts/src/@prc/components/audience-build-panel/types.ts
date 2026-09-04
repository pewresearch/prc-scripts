export type VerificationMode = 'verified' | 'unverified' | 'all';
export type AudiencePanelStatus =
	| 'idle'
	| 'loading'
	| 'queued'
	| 'scanning'
	| 'building'
	| 'deleting'
	| 'creating-draft'
	| 'error';
export type AudienceSnapshot = {
	key: string;
	label: string;
	count: number;
	verification: VerificationMode;
	builtAt: string | null;
	referencingPostIds?: number[];
	stats?: {
		scanned?: number;
		matched?: number;
		v2Groups?: number;
	};
};
export type AudienceBuildPanelProps = {
	title?: string;
	helpText?: string;
	audiences: AudienceSnapshot[];
	status: AudiencePanelStatus;
	errorMessage?: string | null;
	defaultVerification?: VerificationMode;
	referencingPostIds?: number[];
	disabled?: boolean;
	disabledHelpText?: string;
	jobStats?: {
		scanned?: number | null;
		matched?: number | null;
		v2Groups?: number | null;
	};
	onBuild: (args: { verification: VerificationMode }) => void;
	onRebuild: (args: { verification: VerificationMode }) => void;
	onDelete: (args: { verification: VerificationMode; key: string }) => void;
	onCreateDraft?: (args: {
		verification: VerificationMode;
		key: string;
	}) => void;
};

export function isAudienceJobInFlight(status: AudiencePanelStatus): boolean {
	return (
		status === 'queued' || status === 'scanning' || status === 'building'
	);
}
