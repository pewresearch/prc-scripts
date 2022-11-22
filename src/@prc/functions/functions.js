/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

function ifMatchSetAttribute(
	needle,
	haystack,
	attrKey,
	attrValue,
	setAttributes,
) {
	if (needle === haystack) {
		setAttributes({ [attrKey]: attrValue });
	}
}

function randomId() {
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return `_${Math.random().toString(36).substr(2, 9)}`;
}

function getTermsByLetter(taxonomy, letter) {
	return new Promise((resolve) => {
		apiFetch({
			path: `/prc-api/v2/blocks/helpers/get-taxonomy-by-letter/?taxonomy=${taxonomy}&letter=${letter}`,
		}).then((terms) => {
			resolve(terms);
		});
	});
}

function getTerms(taxonomy, perPage = 25) {
	return new Promise((resolve) => {
		const data = {};
		apiFetch({
			path: `/wp/v2/${taxonomy}?per_page=${perPage}`,
		}).then((terms) => {
			for (let index = 0; index < terms.length; index++) {
				const slug = terms[index].slug.replace(
					`${taxonomy.toLowerCase()}_`,
					'',
				);
				data[terms[index].id] = {
					id: terms[index].id,
					name: terms[index].name,
					parent: terms[index].parent,
					slug,
				};
			}
			resolve(data);
		});
	});
}

function getTermsAsOptions(
	taxonomy,
	perPage,
	termValue = 'slug',
	sortByLabel = true,
) {
	return new Promise((resolve) => {
		getTerms(taxonomy, perPage).then((data) => {
			const labelOptions = [];

			Object.keys(data).forEach((key) => {
				const termObj = data[key];

				const value = termObj[termValue];

				let label = termObj.name;
				if (undefined !== termObj.parent && 0 !== termObj.parent) {
					label = ` -- ${label}`;
				}

				labelOptions.push({
					value,
					label,
				});
			});

			if (false !== sortByLabel) {
				labelOptions.sort((a, b) => (a.label > b.label ? 1 : -1));
			}

			resolve(labelOptions);
		});
	});
}

function getTermsAsTree(taxonomy) {
	return new Promise((resolve) => {
		getTerms(taxonomy).then((data) => {
			const treeData = [];
			// Convert data from object of objects to array of objects.
			const convertedData = Object.keys(data).map((i) => data[i]);
			// Filter out the parent terms first
			const parentTerms = convertedData.filter((e) => 0 === e.parent);
			parentTerms.forEach((e) => {
				// Get children by filtering for terms with parent matching this id in loop.
				const c = convertedData.filter((f) => f.parent === e.id);
				const children = [];
				// Construct children array.
				c.forEach((cT) => {
					children.push({
						name: cT.name,
						id: cT.id,
					});
				});
				// Finally, push the fully structured parent -> child relationship to the tree data.
				treeData.push({
					name: e.name,
					id: e.id,
					children,
				});
			});

			resolve(treeData);
		});
	});
}

export {
	getTerms,
	getTermsByLetter,
	getTermsAsOptions,
	getTermsAsTree,
	ifMatchSetAttribute,
	randomId,
};
