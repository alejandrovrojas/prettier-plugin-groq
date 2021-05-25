# Prettier GROQ

This formatter follows the Prettier philosophy of being opinionated and provide few options. The input code is formatted directly from the AST, thereby not preserving whitespace and ignoring comments (see _currently unsupported_ below).

### Overview

#### Groups

Much of the formatting work revolves around grouping object properties in different ways:

1. All properties are placed on separate lines except for properties using the shorthand syntax (_see options below_).
2. All properties of the same value type are grouped and separated from the next group by an empty line.
3. All properties that include projections or object-like values are separated by an empty line.

```
*[] {
   _id, _type, _createdAt,

   foo->,
   bar[]->,

   'abc': *[defined(test)],
   'def': *[defined(test)] | order(test asc),
   'ghi': *[defined(test)] | order(test asc) | [0...10],

   $value >= other_value => {
      'foo': 123
   },

   'a': 'a',
   'b': 2 + 2,
   'c': [1, 2, 3],
   'd': count(value),

   'e': {
      alpha, beta
   },

   f {
      gamma->
   }
}
```

#### Line length

The formatter respects the `printWidth` setting and wraps your code accordingly.

```
*[
   _id == $id
   && $type == _type
   && category == 'long_query'
   && active == true
   && featured == true
   && !(_id in path('drafts.**'))
   && (other == true || test < 10)
] | order(_id asc) [0...10]
```

#### Object expansion

The expansion operator is printed inline if the projection has exactly 2 properties. This is useful for simple exceptions.

```
*[] {
   ...,

   body[] {
      ..., _type == 'image' => @->
   },

   preview {
      ..., asset->
   }
}
```

#### Select

The `select` function arguments are always printed on separate lines:

```
*[] {
   'selection': select(
      popularity > 20 => 'high',
      popularity > 10 => 'medium',
      popularity <= 10 => 'low'
   )
}
```

#### Order

The `order` component is rarely used with many arguments and is therefore always printed inline.

```
*[] | order(few asc, items desc)
```

This is also done to prevent wrapping the `order` scope before wrapping the filter component in long queries:

_Bad:_

```
*[_id == $id && $type == _type && category == 'long_query'] | order(
   featured asc
) [0...10]
```

_Better:_

```
*[
   _id == $id
   && $type == _type
   && category == 'long_query'
] | order(featured asc) [0...10]
```

### Installation

Install as a development dependency

```
npm install --save-dev prettier-plugin-groq
```

### Integration

When installed locally, the plugin should automatically be picked up by your editor if it supports Prettier ([VS Code](https://github.com/prettier/prettier-vscode), [Sublime Text 3](https://packagecontrol.io/packages/JsPrettier)). When installed globally, the plugin is picked up by the prettier CLI:

```
prettier -w file.groq
```

### Options

-  `groqInlineShorthandProperties` _(default: `true`)_

   Controls whether object properties using the shorthand syntax will be grouped inline:

   ```
   *[] {
     _id, _type, other, value
   }
   ```

   or not:

   ```
   *[] {
     _id,
     _type,
     other,
     value
   }
   ```

### Currently unsupported

-  Inline comments `//like this` as they're currently ignored by the parser
-  Map components `* | ([ like, this ])` as they're currently not supported by the parser
