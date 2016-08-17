/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */
import cases from 'postcss-parser-tests';
import test from 'ava';

import parse from '../src/inherit-parse';

cases.each((name, css, json) => {
  test(`parses  ${name}`, t => {
    const parsed = cases.jsonify(parse(css, { from: name }));
    t.deepEqual(parsed, json);
  });
});

test('parses inherit rules', t => {
  const root = parse('.b:before { content: ""; } .a { inherit: .b:before; }');
  t.deepEqual(root.nodes[1].nodes[0].value, '.b:before');
});

test('parses inherit rules', t => {
  const root = parse(
    '.a { color: red; } .b { extend: .a; }',
    { propertyRegExp: /^extends?$/ }
  );
  t.deepEqual(root.nodes[1].nodes[0].value, '.a');
});

test('fails when the property isn\'t correct', t => {
  t.throws(() => {
    parse('.b:before { content: ""; } .a { not-inherit: .b:before; }');
  }, /Missed semicolon/);
});
