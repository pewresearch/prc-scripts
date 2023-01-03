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
	className,
	value,
	onChange,
	allowMultiple = false,
}) {
	const [currentValue, setCurrentValue] = useState(value);
	const { records } = useSelect((select) => {
		const { getEntitiesConfig } = select('core');
		return {
			records: getEntitiesConfig('taxonomy'),
		};
	});
	const [tokens, setTokens] = useState([]);

	useEffect(() => {
		if (0 < records.length && 0 === tokens.length) {
			const newTokens = records.map((taxonomy) => ({
				label: taxonomy.label,
				value: taxonomy.name,
			}));
			setTokens(newTokens);
		}
	}, [records]);

	useEffect(() => {
		if (currentValue) {
			console.log('Value Changed 2: ', currentValue);
			onChange(currentValue);
		}
	}, [currentValue]);

	const hasTokens = tokens ? 0 < tokens.length : false;

	const label = `Select a taxonomy`;

	return (
		<div className={className}>
			{!hasTokens && <Spinner />}
			{hasTokens && !allowMultiple && (
				<SelectControl
					label={label}
					value={currentValue}
					options={tokens}
					onChange={(newValue) => {
						console.log('Value Changed 1: ', newValue);
						setCurrentValue(newValue);
					}}
					__nextHasNoMarginBottom
				/>
			)}
			{hasTokens && allowMultiple && (
				<MultiSelectWrapper>
					<MultiSelectControl
						label={label}
						value={currentValue}
						options={tokens}
						onChange={(newValue) => {
							setCurrentValue(newValue);
						}}
					/>
				</MultiSelectWrapper>
			)}
		</div>
	);
}
