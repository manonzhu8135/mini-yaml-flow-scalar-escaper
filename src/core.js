/**
 * Escapes strings for safe inclusion in YAML flow scalars.
 *
 * YAML flow scalars appear inside flow collections ({...} and [...]) or as
 * plain scalars in block context. They are delimited by commas, brackets, and
 * braces, and they cannot contain certain indicator characters at the start.
 *
 * The functions here take a plain string and return a string that can be
 * placed inside a flow scalar without changing its meaning. They do NOT add
 * surrounding quotes; the caller decides whether to use single quotes,
 * double quotes, or plain style.
 *
 * The trade-off: we escape aggressively. A string that could technically be
 * left alone in some contexts is still escaped, because the caller may not
 * know the surrounding context. This makes the output slightly noisier but
 * always safe to drop into any flow scalar position.
 */

const INDICATORS = new Set(['-', '?', ':', ',', '[', ']', '{', '}', '#', '&', '*', '!', '|', '>', "'", '"', '%', '@', '`']);

/**
 * Returns true if the character is a YAML indicator that must be escaped
 * when it appears at the start of a flow scalar.
 */
function isIndicator(ch) {
  return INDICATORS.has(ch);
}

/**
 * Escapes a string for use as a double-quoted YAML flow scalar.
 *
 * In double-quoted style, the only characters that absolutely must be
 * escaped are the double quote itself and the backslash. However, YAML
 * processors also interpret control characters, so we escape those too.
 * We deliberately do not escape normal printable ASCII or Unicode text:
 * over-escaping would make the output unreadable without adding safety.
 *
 * @param {string} value
 * @returns {string}
 */
export function escapeFlowScalarDoubleQuoted(value) {
  if (typeof value !== 'string') {
    throw new TypeError('value must be a string');
  }
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0);
    switch (ch) {
      case '"':
        out += '\\"';
        break;
      case '\\':
        out += '\\\\';
        break;
      case '\n':
        out += '\\n';
        break;
      case '\r':
        out += '\\r';
        break;
      case '\t':
        out += '\\t';
        break;
      default:
        if (code < 0x20 || code === 0x7f) {
          // Escape other control characters as \xNN.
          out += '\\x' + code.toString(16).padStart(2, '0');
        } else {
          out += ch;
        }
    }
  }
  return out;
}

/**
 * Escapes a string for use as a single-quoted YAML flow scalar.
 *
 * Single-quoted YAML scalars have exactly one escape sequence: a single
 * quote is written as two single quotes. No other character needs escaping.
 * We still check for control characters and reject them, because YAML does
 * not allow raw control characters in single-quoted scalars either, and
 * silently emitting them would produce invalid YAML.
 *
 * @param {string} value
 * @returns {string}
 */
export function escapeFlowScalarSingleQuoted(value) {
  if (typeof value !== 'string') {
    throw new TypeError('value must be a string');
  }
  let out = '';
  for (const ch of value) {
    if (ch === "'") {
      out += "''";
    } else {
      const code = ch.codePointAt(0);
      if (code < 0x20 || code === 0x7f) {
        throw new Error('single-quoted flow scalars cannot contain control characters');
      }
      out += ch;
    }
  }
  return out;
}

/**
 * Escapes a string for use as an unquoted (plain) YAML flow scalar.
 *
 * Plain scalars are the trickiest: they cannot start with an indicator
 * character, they cannot contain the flow delimiters `,`, `[`, `]`, `{`,
 * `}`, and they cannot contain `#` preceded by whitespace (which starts a
 * comment). We escape by prefixing with a backslash, which is not standard
 * YAML for plain scalars, so this function actually returns a double-quoted
 * scalar when escaping is needed. That is a deliberate choice: plain scalars
 * have no escape mechanism, so the only way to make an arbitrary string safe
 * is to switch to a quoted style.
 *
 * If the input is already safe as a plain scalar, it is returned unchanged.
 *
 * @param {string} value
 * @returns {string}
 */
export function escapeFlowScalar(value) {
  if (typeof value !== 'string') {
    throw new TypeError('value must be a string');
  }
  if (value.length === 0) {
    // An empty plain scalar is ambiguous; return an empty double-quoted scalar.
    return '""';
  }
  const first = value[0];
  if (isIndicator(first)) {
    return '"' + escapeFlowScalarDoubleQuoted(value) + '"';
  }
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === ',' || ch === '[' || ch === ']' || ch === '{' || ch === '}') {
      return '"' + escapeFlowScalarDoubleQuoted(value) + '"';
    }
    if (ch === '#' && (i === 0 || /\s/.test(value[i - 1]))) {
      return '"' + escapeFlowScalarDoubleQuoted(value) + '"';
    }
  }
  return value;
}
