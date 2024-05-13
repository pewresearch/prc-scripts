/**
 * WordPress Dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { select } from '@wordpress/data';

export default function useMultiEntityRecords(
	entityType = 'postType',
	entitySubTypes = [],
	entityArgs = {},
	options = {
		enabled: false,
	}
) {
	const [resolvingRecords, setIsResolving] = useState(false);
	const [allRecords, setAllRecords] = useState([]);

	useEffect(() => {
		if (!options.enabled) {
			return;
		}
		setIsResolving(true);
		const fetchRecords = async () => {
			const fetchedRecords = await Promise.all(
				entitySubTypes.map((subType) =>
					select('core').getEntityRecords(
						entityType,
						subType,
						entityArgs
					)
				)
			);
			console.log('fetchedRecords', fetchedRecords);
			// remove any fetched records that are null
			const filteredRecords = fetchedRecords.filter(
				(records) => records !== null
			);
			console.log('filteredRecords', filteredRecords);
			const mergedRecords = filteredRecords.flat();
			console.log('mergedRecords', mergedRecords);
			setAllRecords(mergedRecords);
			setIsResolving(false);
		};
		fetchRecords();
	}, [entityType, entitySubTypes, entityArgs, options.enabled]);

	return {
		records: allRecords,
		isResolving: resolvingRecords,
	};
}
