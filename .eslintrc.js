module.exports = {
	parser: '@typescript-eslint/parser', // Specifies the ESLint parser
	//extends: [
	//    'prettier',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
	//    'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
	//],
	parserOptions: {
		ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		experimentalDecorators: true,
	},
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	rules: {
		'@typescript-eslint/camelcase': 0,
		'import/no-unresolved': 'error',
		'import/order': [
			'error',
			{
				groups: [
					'builtin', // Built-in imports (come from NodeJS native) go first
					'external', // <- External imports
					'internal', // <- Absolute imports
					['sibling', 'parent'], // <- Relative imports, the sibling and parent types they can be mingled together
					'index', // <- index imports
					'unknown', // <- unknown
				],
				'newlines-between': 'always',
				alphabetize: {
					/* sort in ascending order. Options: ["ignore", "asc", "desc"] */
					order: 'asc',
					/* ignore case. Options: [true, false] */
					caseInsensitive: true,
				},
			},
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'sort-imports': [
			'error',
			{
				ignoreCase: false,
				ignoreDeclarationSort: true, // don"t want to sort import lines, use eslint-plugin-import instead
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
				allowSeparatedGroups: true,
			},
		],
	},
	settings: {
		'import/resolver': {
			typescript: {
				project: './tsconfig.json',
			},
		},
	},
};
