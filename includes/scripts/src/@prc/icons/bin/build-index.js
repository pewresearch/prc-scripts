/**
 * Copy the curated PRC + brands picker index into icon-library-index.json.
 *
 * Fill sprites live at prc-icon-library/build/icons/{prc,brands}.svg.
 * Font Awesome Pro weight sprites are gone.
 */

/* eslint-disable no-console -- CLI status for the generate:index script. */

const fs = require('fs');
const path = require('path');

const curatedPath = path.join(__dirname, '../src/curated-prc-icons.json');
const outputFile = path.join(__dirname, '../src/icon-library-index.json');

if (!fs.existsSync(curatedPath)) {
	console.error(
		'Missing curated-prc-icons.json. Run `npm run generate:icon-manifest -w @prc/icon-library` first.'
	);
	process.exit(1);
}

const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
const index = {
	prc: Array.isArray(curated.prc) ? curated.prc : [],
	brands: Array.isArray(curated.brands) ? curated.brands : [],
};

fs.writeFileSync(outputFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(
	`Wrote icon-library-index.json (${index.prc.length} prc, ${index.brands.length} brands)`
);
