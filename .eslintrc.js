module.exports = {
	extends: ['../../.eslintrc.js'],
	overrides: [
		{
			files: ['includes/scripts/src/**/*.{js,jsx,ts,tsx}'],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
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
