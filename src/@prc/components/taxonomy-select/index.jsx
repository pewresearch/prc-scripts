/**
 * External Dependencies
 */
import { MultiSelectControl } from '@codeamp/block-components';
import styled from '@emotion/styled';

/**
 * WordPress Dependencies
 */
import { SelectControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

const MultiSelectWrapper = styled('div')`
	& .components-button.has-icon {
		padding: 0px !important;
	}
`;

export default function TaxonomySelect({
	value,
	onChange,
	allowMultiple = false,
}) {
	const { records } = useSelect((select) => {
		const { getEntitiesConfig } = select('core');
		return {
			records: getEntitiesConfig('taxonomy'),
		};
	});

	const [tokens, setTokens] = useState([]);

	useEffect(() => {
		if (0 < records.length) {
			const newTokens = records.map((taxonomy) => ({
				label: taxonomy.label,
				value: taxonomy.name,
			}));
			setTokens(newTokens);
		}
	}, [records]);

	const hasTokens = tokens ? 0 < tokens.length : false;

	return (
		<div>
			{!hasTokens && <Spinner />}
			{hasTokens && !allowMultiple && (
				<SelectControl
					label="Taxonomy"
					value={value[0]}
					options={tokens}
					onChange={(newValue) => onChange([newValue])}
					style={{ marginBottom: '0px' }}
				/>
			)}
			{hasTokens && allowMultiple && (
				<MultiSelectWrapper>
					<MultiSelectControl
						label="Taxonomy"
						value={value}
						options={tokens}
						onChange={(newValue) => {
							onChange(newValue);
						}}
					/>
				</MultiSelectWrapper>
			)}
		</div>
	);
}
