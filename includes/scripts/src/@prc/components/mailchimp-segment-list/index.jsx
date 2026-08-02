/**
 * Audience + multi saved-segment toggles (email-builder cascade).
 *
 * Loads audiences/segments from prc-email-builder REST. Toggle values are
 * saved-segment IDs (not interest IDs).
 * Also supports the legacy interest-ID list used by deprecated mailchimp-select.
 */

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	ToggleControl,
	SelectControl,
	Spinner,
	Notice,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal Dependencies
 */
import {
	useMailchimpAudiences,
	useMailchimpSegments,
} from '../mailchimp/use-mailchimp-data';

/**
 * Legacy interest-ID multi-toggle for deprecated mailchimp-select blocks.
 *
 * @param {Object}   props
 * @param {Array}    [props.interests]
 * @param {Function} [props.onAdd]
 * @param {Function} [props.onRemove]
 * @param {Function} [props.onUpdate]
 */
function LegacyMailchimpInterestList({
	interests = [],
	onAdd = () => {},
	onRemove = () => {},
	onUpdate = () => {},
}) {
	const [selected, setSelected] = useState(interests);
	const [records, setRecords] = useState([]);

	const updateSelection = (item) => {
		const tmp = [...selected];
		const index = tmp.indexOf(item.value);
		if (-1 !== index) {
			tmp.splice(index, 1);
			onRemove(item);
		} else {
			tmp.push(item.value);
			onAdd(item);
		}
		setSelected(tmp);
	};

	useEffect(() => {
		onUpdate(selected);
	}, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		apiFetch({
			path: addQueryArgs('/prc-api/v3/mailchimp/get-segments', {
				api_key: 'mailchimp-select',
			}),
		}).then((response) => {
			setRecords(response);
		});
	}, []);

	const memoizedOptions = useMemo(() => {
		if (!records) {
			return [];
		}
		return Object.keys(records).map((key) => ({
			label: records[key].name,
			value: records[key].interest_id,
		}));
	}, [records]);

	return (
		<div>
			{memoizedOptions.map((item) => (
				<ToggleControl
					key={item.value}
					label={item.label}
					checked={selected.includes(item.value)}
					onChange={() => updateSelection(item)}
				/>
			))}
		</div>
	);
}

/**
 * Audience + multi saved-segment toggles.
 *
 * @param {Object}   props
 * @param {string}   [props.audienceId]
 * @param {Function} [props.onAudienceChange]
 * @param {string[]} [props.segmentIds]
 * @param {Function} [props.onAdd]
 * @param {Function} [props.onRemove]
 * @param {Function} [props.onUpdate]
 * @param {boolean}  [props.disabled]
 */
function AudienceSegmentList({
	audienceId = '',
	onAudienceChange,
	segmentIds = [],
	onAdd = () => {},
	onRemove = () => {},
	onUpdate = () => {},
	disabled = false,
}) {
	const [selected, setSelected] = useState(
		Array.isArray(segmentIds) ? segmentIds.map(String) : []
	);

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

	useEffect(() => {
		setSelected(Array.isArray(segmentIds) ? segmentIds.map(String) : []);
	}, [segmentIds]);

	useEffect(() => {
		onUpdate(selected);
	}, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

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

	const options = useMemo(
		() =>
			segments.map((s) => ({
				label: `${s.name} (${Number(s.member_count || 0).toLocaleString()})`,
				value: String(s.id),
			})),
		[segments]
	);

	const handleAudienceChange = (nextAudienceId) => {
		onAudienceChange?.(nextAudienceId);
		setSelected([]);
	};

	const updateSelection = (item) => {
		const next = [...selected];
		const index = next.indexOf(item.value);
		if (index !== -1) {
			next.splice(index, 1);
			onRemove(item);
		} else {
			next.push(item.value);
			onAdd(item);
		}
		setSelected(next);
	};

	return (
		<div>
			{audiencesError && (
				<Notice status="error" isDismissible={false}>
					{audiencesError}
				</Notice>
			)}
			{audiencesLoading ? (
				<Spinner />
			) : (
				<SelectControl
					label={__('Mailchimp audience', 'prc-scripts')}
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
						options.map((item) => (
							<ToggleControl
								key={item.value}
								label={item.label}
								checked={selected.includes(item.value)}
								onChange={() => updateSelection(item)}
								disabled={disabled}
							/>
						))
					)}
				</>
			)}
		</div>
	);
}

/**
 * @param {Object}   props
 * @param {string}   [props.audienceId]
 * @param {Function} [props.onAudienceChange]
 * @param {string[]} [props.segmentIds]
 * @param {Array}    [props.interests]        Legacy interest IDs (deprecated mailchimp-select).
 * @param {Function} [props.onAdd]
 * @param {Function} [props.onRemove]
 * @param {Function} [props.onUpdate]
 * @param {boolean}  [props.disabled]
 */
export default function MailchimpSegmentList(props) {
	// Deprecated mailchimp-select blocks still pass interests without audience.
	if (
		typeof props.onAudienceChange !== 'function' &&
		Object.prototype.hasOwnProperty.call(props, 'interests')
	) {
		return <LegacyMailchimpInterestList {...props} />;
	}

	return <AudienceSegmentList {...props} />;
}
