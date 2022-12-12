import { useEntityRecords } from '@wordpress/core-data';
import { SelectControl, Spinner } from '@wordpress/components';

export default function TaxonomySelect({ value, onChange }) {
	const { records, isResolving } = useEntityRecords('taxonomy', value, {
		per_page: -1,
		hide_empty: false,
		context: 'view',
	});
	const hasRecords = records ? 0 < records.length : false;

	return (
		<div>
			{isResolving && <Spinner />}
			{!isResolving && hasRecords && (
				<SelectControl
					value={value}
					options={records.map((term) => ({
						label: term.name,
						value: term.slug,
					}))}
					onChange={(l) => {
						onChange({ label: l });
					}}
					style={{ marginBottom: '0px' }}
				/>
			)}
		</div>
	);
}
