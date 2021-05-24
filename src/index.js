const { parse } = require('groq-js');
const { print } = require('./printer.js');

const languages = [
	{
		extensions: ['.groq'],
		name: 'GROQ',
		parsers: ['groq-parse'],
	},
];

const parsers = {
	'groq-parse': {
		parse: text => parse(text),
		astFormat: 'groq-print',
	},
};

const printers = {
	'groq-print': {
		print: print,
	},
};

const options = {
	groqInlinePropertyShorthand: {
		type: 'boolean',
		category: 'Global',
		default: true,
		description: 'Inlines object properties that use the shorthand expression without projections',
	},
};

module.exports = {
	languages,
	parsers,
	printers,
	options,
};
