import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeFlowScalar, escapeFlowScalarDoubleQuoted, escapeFlowScalarSingleQuoted } from '../src/index.js';

test('escapeFlowScalar returns plain string when safe', () => {
  assert.equal(escapeFlowScalar('hello'), 'hello');
  assert.equal(escapeFlowScalar('hello world'), 'hello world');
  assert.equal(escapeFlowScalar('a-b_c'), 'a-b_c');
});

test('escapeFlowScalar quotes strings starting with indicator', () => {
  assert.equal(escapeFlowScalar('- dash'), '"- dash"');
  assert.equal(escapeFlowScalar('? question'), '"? question"');
  assert.equal(escapeFlowScalar(': colon'), '": colon"');
  assert.equal(escapeFlowScalar('@at'), '"@at"');
});

test('escapeFlowScalar quotes strings containing flow delimiters', () => {
  assert.equal(escapeFlowScalar('a,b'), '"a,b"');
  assert.equal(escapeFlowScalar('a[b'), '"a[b"');
  assert.equal(escapeFlowScalar('a]b'), '"a]b"');
  assert.equal(escapeFlowScalar('a{b'), '"a{b"');
  assert.equal(escapeFlowScalar('a}b'), '"a}b"');
});

test('escapeFlowScalar quotes strings with comment indicator', () => {
  assert.equal(escapeFlowScalar('a # comment'), '"a # comment"');
  assert.equal(escapeFlowScalar('# start'), '"# start"');
});

test('escapeFlowScalar returns empty double-quoted for empty string', () => {
  assert.equal(escapeFlowScalar(''), '""');
});

test('escapeFlowScalarDoubleQuoted escapes quotes and backslashes', () => {
  assert.equal(escapeFlowScalarDoubleQuoted('say "hi"'), 'say \\"hi\\"');
  assert.equal(escapeFlowScalarDoubleQuoted('back\\slash'), 'back\\\\slash');
});

test('escapeFlowScalarDoubleQuoted escapes control characters', () => {
  assert.equal(escapeFlowScalarDoubleQuoted('line\nbreak'), 'line\\nbreak');
  assert.equal(escapeFlowScalarDoubleQuoted('tab\there'), 'tab\\there');
  assert.equal(escapeFlowScalarDoubleQuoted('\x00null'), '\\x00null');
  assert.equal(escapeFlowScalarDoubleQuoted('\x7fdel'), '\\x7fdel');
});

test('escapeFlowScalarSingleQuoted doubles single quotes', () => {
  assert.equal(escapeFlowScalarSingleQuoted("it's"), "it''s");
  assert.equal(escapeFlowScalarSingleQuoted("''"), "''''");
});

test('escapeFlowScalarSingleQuoted rejects control characters', () => {
  assert.throws(() => escapeFlowScalarSingleQuoted('a\nb'), /control characters/);
});

test('escapeFlowScalar rejects non-string input', () => {
  assert.throws(() => escapeFlowScalar(123), TypeError);
  assert.throws(() => escapeFlowScalarDoubleQuoted(null), TypeError);
  assert.throws(() => escapeFlowScalarSingleQuoted(undefined), TypeError);
});
