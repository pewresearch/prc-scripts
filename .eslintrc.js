module.exports = {
	extends: ['../../.eslintrc.js'],
	overrides: [
		{
			// charting-utilities is the shared charting layer that
			// `no-restricted-imports` points consumers toward, so it builds
			// directly on the @visx primitives that rule blocks elsewhere.
			files: [
				'includes/scripts/src/@prc/charting-utilities/**/*.{ts,tsx}',
			],
			rules: {
				'no-restricted-imports': 'off',
			},
		},
	],
};
