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

module.exports = {
	languages,
	parsers,
	printers,
};
