const { label, group, join, indent, line, softline, hardline, ifBreak, breakParent } = require('prettier').doc.builders;

function printGROQ(path, options, print) {
	const node = path.getValue();
	const ß = key => path.call(print, key);
	const ßß = key => path.map(print, key);
	const parent = type => (!path.getParentNode() ? false : path.getParentNode().type === type);

	const array_pipe = false;
	const inline_simple = true;

	function return_value(node) {
		return typeof node.value === 'string'
			? options.singleQuote
				? `'${node.value}'`
				: `"${node.value}"`
			: node.value.toString();
	}

	switch (node.type) {
		case 'Star':
			return '*';

		case 'Parent':
			return '^';

		case 'This':
			return label(node.type, parent('ObjectSplat') ? '' : '@');

		case 'Value':
			return label(node.type, return_value(node));

		case 'Identifier':
			return label(node.type, node.name);

		case 'Parameter':
			return label(node.type, ['$', node.name]);

		case 'Element':
			return label(node.type, [ß('base'), array_pipe ? ' | ' : ' ', '[', ß('index'), ']']);

		case 'Mapper':
			return label(node.type, [ß('base'), '[]']);

		case 'Attribute':
			return label(node.type, [ß('base'), '.', node.name]);

		case 'Deref':
			return label(node.type, [ß('base'), '->']);

		case 'Asc':
			return label(node.type, [ß('base'), ' asc']);

		case 'Desc':
			return label(node.type, [ß('base'), ' desc']);

		case 'Parenthesis':
			return label(node.type, ['(', ß('base'), ')']);

		case 'Not':
			return label(node.type, ['!', ß('base')]);

		case 'ObjectSplat':
			return label(node.type, ['...', ß('value')]);

		case 'ObjectConditionalSplat':
			return label(node.type, [ß('condition'), ' => ', ß('value')]);

		case 'OpCall':
			return label(node.type, [ß('left'), ` ${node.op} `, ß('right')]);

		case 'Pair':
			return label(node.type, [ß('left'), ' => ', ß('right')]);

		case 'Slice':
			return label(node.type, [
				ß('base'),
				array_pipe ? ' | ' : ' ',
				'[',
				ß('left'),
				node.isExclusive ? '...' : '..',
				ß('right'),
				']',
			]);

		case 'Filter':
			return label(node.type, group([ß('base'), '[', indent([softline, ß('query')]), softline, ']']));

		case 'Projection':
			return label(node.type, group([ß('base'), ' {', indent([line, ß('query')]), line, '}']));

		case 'And':
		case 'Or':
			const operators = { And: '&& ', Or: '|| ' };
			const query = [ß('left'), parent('Parenthesis') ? ' ' : line, operators[node.type], ß('right')];
			return parent('ObjectConditionalSplat') ? label(node.type, group(query)) : label(node.type, query);

		case 'FuncCall':
			const select_exception = node.name === 'select' ? hardline : line;
			return label(
				node.type,
				group([node.name, '(', indent([softline, join([',', select_exception], ßß('args'))]), softline, ')'])
			);

		case 'PipeFuncCall':
			return label(
				node.type,
				group([ß('base'), ' | ', node.name, '(', indent([softline, join([',', line], ßß('args'))]), softline, ')'])
			);

		case 'Array':
			return label(node.type, group(['[', indent([softline, join([',', line], ßß('elements'))]), softline, ']']));

		case 'ArrayElement':
			return label(node.type, node.isSplat ? ['...', ß('value')] : ß('value'));

		case 'Object':
			const attributes = ßß('attributes');

			attributes.forEach((attribute, i, a) => {
				if (a.length > 1 && i < a.length - 1) {
					const last = attribute.contents[attribute.contents.length - 1];

					attribute.contents.push(',');

					if (['Projection', 'FuncCall', 'Deref', 'Slice', 'PipeFuncCall', 'Object'].includes(last.label)) {
						attribute.contents.push(hardline, hardline);
					} else if (attribute.label === 'EqualSimpleObjectAttributes') {
						const next = a[i + 1];

						if (next && next.label === 'EqualSimpleObjectAttributes') {
							attribute.contents.push(inline_simple ? ' ' : line);
						} else {
							attribute.contents.push(hardline, hardline);
						}
					} else if (i === 0 && attribute.label === 'ObjectSplat') {
						if (attributes.length === 2) {
							attribute.contents.push(' ');
						} else {
							attribute.contents.push(hardline, hardline);
						}
					} else {
						attribute.contents.push(line);
					}
				}
			});

			const should_break =
				inline_simple && attributes.every(a => a.label === 'EqualSimpleObjectAttributes') ? '' : breakParent;

			return parent('Projection')
				? label(node.type, group([attributes, should_break]))
				: label(node.type, group(['{', indent([line, attributes, should_break]), line, '}']));

		case 'ObjectAttribute':
			const value_name = node => (node.base ? value_name(node.base) : node.name);
			const equal_identifiers = node.key.value === value_name(node.value);

			if (equal_identifiers) {
				return label(node.key.value === node.value.name ? 'EqualSimpleObjectAttributes' : 'EqualObjectAttributes', [
					ß('value'),
				]);
			}

			return label(node.type, [ß('key'), ': ', ß('value')]);

		default:
			return '';
	}
}

exports.print = printGROQ;
