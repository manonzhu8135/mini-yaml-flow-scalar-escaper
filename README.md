# mini-yaml-flow-scalar-escaper

Escapes strings for safe inclusion in YAML flow scalars, handling special characters and indicator sequences.

## Usage

```js
import { escapeFlowScalar, escapeFlowScalarDoubleQuoted, escapeFlowScalarSingleQuoted } from 'mini-yaml-flow-scalar-escaper';

// Plain scalar: returns the string unchanged if it is safe, otherwise wraps it in double quotes.
escapeFlowScalar('hello world');      // 'hello world'
escapeFlowScalar('a,b');             // '"a,b"'
escapeFlowScalar('- dash');          // '"- dash"'

// Double-quoted scalar: you add the surrounding quotes yourself.
escapeFlowScalarDoubleQuoted('say "hi"'); // 'say \\"hi\\"'

// Single-quoted scalar: you add the surrounding quotes yourself.
escapeFlowScalarSingleQuoted("it's"); // "it''s"
```

The package is ESM-only. It has no dependencies.

## Why this exists

YAML flow scalars (the values inside `{...}` and `[...]`) have stricter rules than block scalars. A plain scalar cannot start with an indicator character, cannot contain `,`, `[`, `]`, `{`, `}`, and cannot contain `#` after whitespace. Getting this wrong produces YAML that parses differently than intended, or not at all.

This library makes one decision: it escapes aggressively. If a string could be unsafe in *any* flow scalar position, it is quoted. This means some strings that would be fine in a specific context still get quotes. The trade-off is safety over minimal output; you never have to reason about the surrounding context.

The awkward edge: `escapeFlowScalar` switches to double-quoted style when escaping is needed, because plain scalars have no escape mechanism. If you need to stay in plain style, you must pre-validate the string yourself. Also, `escapeFlowScalarSingleQuoted` throws on control characters instead of silently producing invalid YAML. Those are the two behaviours to know about.

## API

- `escapeFlowScalar(value: string): string` — Returns a safe plain scalar, or a double-quoted scalar if the input is unsafe. Throws `TypeError` for non-strings.
- `escapeFlowScalarDoubleQuoted(value: string): string` — Escapes for double-quoted style. Does not add surrounding quotes. Throws `TypeError` for non-strings.
- `escapeFlowScalarSingleQuoted(value: string): string` — Escapes for single-quoted style. Does not add surrounding quotes. Throws `TypeError` for non-strings, and throws `Error` if the input contains a control character.
