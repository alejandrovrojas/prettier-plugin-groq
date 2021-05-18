const { parse } = require('groq-js');
const fs = require('fs');
const path = require('path');
const query = fs.readFileSync(path.resolve(__dirname, './input.groq'), 'utf8');

console.log(JSON.stringify(parse(query), null, 2));
