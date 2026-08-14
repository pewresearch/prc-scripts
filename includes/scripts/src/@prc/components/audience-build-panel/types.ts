export type VerificationMode = 'verified' | 'unverified' | 'all';
export type AudiencePanelStatus =
	| 'idle'
	| 'loading'
	| 'building'
	| 'deleting'
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
	onBuild: (args: { verification: VerificationMode }) => void;
	onRebuild: (args: { verification: VerificationMode }) => void;
	onDelete: (args: { verification: VerificationMode; key: string }) => void;
};
