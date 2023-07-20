/**
 * WordPress Dependencies
 */
import apiFetch from '@wordpress/api-fetch';

// @TODO: move these into VIP environment values or into the DB?
const mailChimpInterests = [
	{
		label: 'Weekly roundup of all new publications',
		value: '7c1390ba46',
	},
	{
		label: 'Quarterly update from the president',
		value: 'a33430a835',
	},
	{
		label: '--',
		value: false,
	},
	{
		label: 'Global attitudes & trends (twice a month)',
		value: '9203343b04',
	},
	{
		label: 'Internet, science & tech (monthly)',
		value: 'ea87b26abe',
	},
	{
		label: 'Daily briefing of media news',
		value: '1d2638430b',
	},
	{
		label: 'Race & ethnicity (monthly)',
		value: '0e7495c7b2',
	},
	{
		label: 'Religion & public life - Weekly newsletter',
		value: 'a7d4f3268f',
	},
	{
		label: 'Religion & public life - Daily religion headlines',
		value: '1a647764b2',
	},
	{
		label: 'Social & demographic trends (monthly)',
		value: '3836f62305',
	},
	{
		label: 'Methodological research (quarterly)',
		value: '6d1e80bbaf',
	},
	{
		label: 'U.S. politics & policy (monthly)',
		value: 'fa5fdbc701',
	},
	{
		label: '--',
		value: false,
	},
	{
		label: 'SELECT ALL',
		value: 'select-all',
	},
	{
		label: '--',
		value: false,
	},
	{
		label: 'Mini-course - U.S. Immigration',
		value: 'xxx',
	},
	{
		label: 'Mini-course - U.S. Census',
		value: 'xxxx',
	},
	{
		label: 'Mini-course - Muslims and Islam',
		value: 'xxxxx',
	},
];

function ifMatchSetAttribute(
	needle,
	haystack,
	attrKey,
	attrValue,
	setAttributes
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
					''
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
	sortByLabel = true
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

// convert an html table into a flat array of arrays
function tableToArray(table) {
	const rows = table.querySelectorAll('tr');
	const data = [];
	for (let i = 0; i < rows.length; i += 1) {
		const row = rows[i];
		const cols = row.querySelectorAll('td, th');
		const rowData = [];
		for (let j = 0; j < cols.length; j += 1) {
			const col = cols[j];
			rowData.push(col.innerText);
		}
		data.push(rowData);
	}
	return data;
}

// cnovert array of arrays to formatted csv, with optional metadata
function arrayToCSV(objArray, metadata) {
	if (undefined === objArray || objArray.length === 0) return false;
	const array =
		'object' !== typeof objArray ? JSON.parse(objArray) : objArray;
	const checkIfEmpty = (str) => (str !== undefined ? str : '');
	let str = '';
	if (undefined !== metadata) {
		str += `${checkIfEmpty(metadata.title)}
			${checkIfEmpty(metadata.subtitle)}

			`;
	}
	console.log({ array });
	for (let i = 0; i < array.length; i += 1) {
		let line = '';
		// if a value has a comma in it, wrap it in quotes
		for (let j = 0; j < array[i].length; j += 1) {
			if (j > 0) line += ',';
			if (array[i][j].indexOf(',') > -1) {
				line += `"${array[i][j]}"`;
			} else {
				line += array[i][j];
			}
		}

		str += `${line}
		`;
	}
	if (undefined !== metadata) {
		str += `
		${checkIfEmpty(metadata.note)}
		${checkIfEmpty(metadata.source)}
		${checkIfEmpty(metadata.tag)}`;
	}
	return str;
}

function wpRestApiTermsToTree(terms, restrictTo = []) {
	const getTopLevel = (termId) => {
		const term = terms.find((t) => t.id === termId);
		if (0 === term.parent) {
			return term;
		}
		return getTopLevel(term.parent, terms);
	};

	const treeData = [];
	if (!terms) {
		return treeData;
	}
	// Convert data from object of objects to array of objects.
	const convertedData = Object.keys(terms).map((i) => terms[i]);
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
				meta: cT.meta,
			});
		});
		// sort children by name
		children.sort((a, b) => (a.name > b.name ? 1 : -1));
		// Finally, push the fully structured parent -> child relationship to the tree data.
		treeData.push({
			name: e.name,
			id: e.id,
			meta: e.meta,
			children,
		});
	});

	let r = treeData;

	if (0 < restrictTo.length) {
		const restrictedTreeData = [];
		restrictTo.forEach((termId) => {
			const topLevel = getTopLevel(termId);
			const topLevelIndex = treeData.findIndex(
				(t) => t.id === topLevel.id
			);
			restrictedTreeData.push(treeData[topLevelIndex]);
		});
		r = restrictedTreeData;
	}

	return r;
}

export {
	getTerms,
	getTermsByLetter,
	getTermsAsOptions,
	getTermsAsTree,
	ifMatchSetAttribute,
	randomId,
	mailChimpInterests,
	tableToArray,
	arrayToCSV,
	wpRestApiTermsToTree,
};
