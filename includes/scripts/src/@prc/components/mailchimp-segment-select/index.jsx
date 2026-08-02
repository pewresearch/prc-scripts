/**
 * Audience + saved-segment picker (email-builder cascade).
 *
 * Loads audiences/segments from prc-email-builder REST.
 * Also supports the legacy interest-ID picker (value/onChange/apiKey/renderAs)
 * used by deprecated mailchimp-form blocks.
 */

/**
 * WordPress Dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	SelectControl,
	Spinner,
	Notice,
	ToolbarDropdownMenu,
	ToolbarButton,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { tag } from '@wordpress/icons';

/**
 * Internal Dependencies
 */
import {
	useMailchimpAudiences,
	useMailchimpSegments,
} from '../mailchimp/use-mailchimp-data';

/**
 * Legacy interest-ID picker for deprecated mailchimp-form blocks.
 *
 * @param {Object}   props
 * @param {string}   [props.label]
 * @param {string}   [props.className]
 * @param {string}   [props.value]
 * @param {Function} props.onChange
 * @param {string}   [props.apiKey]
 * @param {string}   [props.renderAs]
 */
function LegacyMailchimpInterestSelect({
	label = 'Select a MailChimp Segment',
	className,
	value,
	onChange,
	apiKey = 'mailchimp-form',
	renderAs = 'select',
}) {
	const [currentValue, setCurrentValue] = useState(value);
	const [records, setRecords] = useState([]);

	useEffect(() => {
		apiFetch({
			path: addQueryArgs('/prc-api/v3/mailchimp/get-segments', {
				api_key: apiKey,
			}),
		}).then((response) => {
			setRecords(response);
		});
	}, [apiKey]);

	// Sync internal state when the value prop changes externally
	// (e.g. toolbar updates the attribute and the inspector needs to follow).
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		setCurrentValue(value);
	}, [value]);

	useEffect(() => {
		if (currentValue) {
			onChange(currentValue);
		}
	}, [currentValue]); // eslint-disable-line react-hooks/exhaustive-deps

	const segments = useMemo(() => {
		if (!records) {
			return [];
		}
		return Object.keys(records).map((key) => ({
			label: records[key].name,
			value: records[key].interest_id,
		}));
	}, [records]);

	const hasSegments = segments.length > 0;

	// Derive the active label from the value prop (source of truth) so both
	// toolbar and inspector always reflect the current block attribute.
	const activeLabel = useMemo(() => {
		if (!value || !hasSegments) {
			return label;
		}
		const match = segments.find((s) => s.value === value);
		return match ? match.label : label;
	}, [value, segments, label, hasSegments]);

	// Options for the default select rendering (with loading placeholder at top).
	const selectOptions = useMemo(
		() => [
			{ label: 'Loading MailChimp segments...', value: '' },
			...segments,
		],
		[segments]
	);

	if (renderAs === 'toolbar-dropdown') {
		if (!hasSegments) {
			return (
				<ToolbarButton>
					<Spinner />
				</ToolbarButton>
			);
		}
		const controls = segments.map((segment) => ({
			title: segment.label,
			isActive: segment.value === value,
			onClick: () => onChange(segment.value),
		}));
		return (
			<ToolbarDropdownMenu
				icon={tag}
				label={activeLabel}
				text={activeLabel}
				controls={controls}
			/>
		);
	}

	// Default 'select' rendering — preserves original SelectControl behavior.
	const hasOptions = selectOptions.length > 0;

	return (
		<div className={className}>
			{!hasOptions && <Spinner />}
			{hasOptions && (
				<SelectControl
					label={label}
					value={currentValue}
					options={selectOptions}
					onChange={(newValue) => {
						setCurrentValue(newValue);
					}}
					__nextHasNoMarginBottom
				/>
			)}
		</div>
	);
}

/**
 * Audience + saved-segment cascade picker.
 *
 * @param {Object}   props
 * @param {string}   [props.className]
 * @param {string}   [props.audienceLabel]
 * @param {string}   [props.segmentLabel]
 * @param {string}   [props.audienceId]
 * @param {string}   [props.segmentId]
 * @param {Function} props.onAudienceChange
 * @param {Function} props.onSegmentChange
 * @param {boolean}  [props.disabled]
 */
function AudienceSegmentSelect({
	className,
	audienceLabel = __('Mailchimp audience', 'prc-scripts'),
	segmentLabel = __('Segment (optional)', 'prc-scripts'),
	audienceId = '',
	segmentId = '',
	onAudienceChange,
	onSegmentChange,
	disabled = false,
}) {
	const {
		audiences,
		loading: audiencesLoading,
		error: audiencesError,
	} = useMailchimpAudiences();
	const {
		segments,
		loading: segmentsLoading,
		error: segmentsError,
	} = useMailchimpSegments(audienceId);

	const audienceOptions = useMemo(
		() => [
			{
				value: '',
				label: __('— Select audience —', 'prc-scripts'),
			},
			...audiences.map((a) => ({
				value: String(a.id),
				label: a.name,
			})),
		],
		[audiences]
	);

	const segmentOptions = useMemo(() => {
		const options = [
			{
				value: '',
				label: __('Entire audience', 'prc-scripts'),
			},
			...segments.map((s) => ({
				value: String(s.id),
				label: `${s.name} (${Number(s.member_count || 0).toLocaleString()})`,
			})),
		];

		const normalizedSegmentId = String(segmentId ?? '');
		if (
			normalizedSegmentId &&
			!options.some((option) => option.value === normalizedSegmentId)
		) {
			options.push({
				value: normalizedSegmentId,
				label: sprintf(
					/* translators: %s: Mailchimp saved segment ID */
					__('Saved segment (%s)', 'prc-scripts'),
					normalizedSegmentId
				),
			});
		}

		return options;
	}, [segments, segmentId]);

	const handleAudienceChange = (nextAudienceId) => {
		// Parents should clear segmentId when audience changes (avoids stale
		// multi-setConfig races). This component only reports the audience.
		onAudienceChange?.(nextAudienceId);
	};

	return (
		<div className={className}>
			{audiencesError && (
				<Notice status="error" isDismissible={false}>
					{audiencesError}
				</Notice>
			)}
			{audiencesLoading ? (
				<Spinner />
			) : (
				<SelectControl
					label={audienceLabel}
					value={String(audienceId ?? '')}
					options={audienceOptions}
					onChange={handleAudienceChange}
					disabled={disabled}
					__nextHasNoMarginBottom
				/>
			)}
			{audienceId && (
				<>
					{segmentsError && (
						<Notice status="warning" isDismissible={false}>
							{segmentsError}
						</Notice>
					)}
					{segmentsLoading ? (
						<Spinner />
					) : (
						<SelectControl
							label={segmentLabel}
							value={String(segmentId ?? '')}
							options={segmentOptions}
							onChange={(next) => onSegmentChange?.(next)}
							disabled={disabled}
							help={__(
								'Optional. Restrict signup targeting to a saved segment of the audience.',
								'prc-scripts'
							)}
							__nextHasNoMarginBottom
						/>
					)}
				</>
			)}
		</div>
	);
}

/**
 * @param {Object}   props
 * @param {string}   [props.className]
 * @param {string}   [props.audienceLabel]
 * @param {string}   [props.segmentLabel]
 * @param {string}   [props.audienceId]
 * @param {string}   [props.segmentId]
 * @param {Function} [props.onAudienceChange]
 * @param {Function} [props.onSegmentChange]
 * @param {boolean}  [props.disabled]
 * @param {string}   [props.label]            Legacy interest picker label.
 * @param {string}   [props.value]            Legacy interest ID.
 * @param {Function} [props.onChange]         Legacy interest onChange.
 * @param {string}   [props.apiKey]           Legacy get-segments api_key.
 * @param {string}   [props.renderAs]         Legacy 'select' | 'toolbar-dropdown'.
 */
export default function MailchimpSegmentSelect(props) {
	// Deprecated mailchimp-form blocks still use value/onChange/apiKey/renderAs.
	if (
		typeof props.onChange === 'function' &&
		typeof props.onAudienceChange !== 'function'
	) {
		return <LegacyMailchimpInterestSelect {...props} />;
	}

	return <AudienceSegmentSelect {...props} />;
}
