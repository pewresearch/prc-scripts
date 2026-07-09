/**
 * WordPress Dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Icon, Tooltip } from '@wordpress/components';
import { check, warning } from '@wordpress/icons';

interface NumberCheckResult {
	/** True when every number in the generated text was verified against the source. */
	valid: boolean;
	/** Numeric claims that could not be verified or are contradicted by the source. */
	flagged: string[];
}

interface AINumberCheckBadgeProps {
	/**
	 * The numberCheck annotation from an AI ability response.
	 * When undefined (checker unavailable), the badge renders nothing —
	 * absence of a check must not read as a false "verified".
	 */
	numberCheck?: NumberCheckResult;
}

/**
 * Inline verification badge for AI-generated copy.
 *
 * Shows a checkmark (admin-theme blue) when every numeric claim in the
 * generated text was verified against the source content, or a warning
 * icon with a tooltip listing the unverified numbers when it was not.
 * @param root0
 * @param root0.numberCheck
 */
export default function AINumberCheckBadge({
	numberCheck,
}: AINumberCheckBadgeProps) {
	if (!numberCheck) {
		return null;
	}

	if (numberCheck.valid) {
		return (
			<Tooltip
				text={__(
					'All numbers verified against the source post.',
					'prc-platform-core'
				)}
			>
				<span
					className="prc-ai-number-check prc-ai-number-check--valid"
					aria-label={__('Numbers verified', 'prc-platform-core')}
				>
					<Icon icon={check} size={16} />
				</span>
			</Tooltip>
		);
	}

	const tooltipText =
		numberCheck.flagged.length > 0
			? sprintf(
					/* translators: %s: comma-separated list of unverified numbers. */
					__(
						'Could not verify these numbers against the source post — please double-check: %s',
						'prc-platform-core'
					),
					numberCheck.flagged.join(', ')
				)
			: __(
					'Some numbers could not be verified against the source post — please double-check.',
					'prc-platform-core'
				);

	return (
		<Tooltip text={tooltipText}>
			<span
				className="prc-ai-number-check prc-ai-number-check--flagged"
				aria-label={__('Unverified numbers', 'prc-platform-core')}
			>
				<Icon icon={warning} size={16} />
			</span>
		</Tooltip>
	);
}
