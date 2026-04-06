import test from 'node:test';
import assert from 'node:assert/strict';

import { EXAMPLES } from '../src/lib/examples.js';
import { convertDocument, validateSource } from '../src/lib/converter.js';

test('converts JSON to YAML using the selected YAML indentation', () => {
  const result = convertDocument({
    sourceText: JSON.stringify(
      {
        service: 'api',
        enabled: true,
        releases: ['stable', 'beta']
      },
      null,
      2
    ),
    sourceFormat: 'json',
    targetFormat: 'yaml',
    targetIndent: 4
  });

  assert.equal(result.ok, true);
  assert.match(result.outputText, /^service: api/m);
  assert.match(result.outputText, /^releases:\n    - stable/m);
});

test('converts YAML to valid JSON using the selected JSON indentation', () => {
  const result = convertDocument({
    sourceText: ['service: api', 'enabled: true', 'ports:', '  - 8080'].join('\n'),
    sourceFormat: 'yaml',
    targetFormat: 'json',
    targetIndent: 4
  });

  assert.equal(result.ok, true);
  assert.match(result.outputText, /^{\n    "service": "api"/);
  assert.deepEqual(JSON.parse(result.outputText), {
    service: 'api',
    enabled: true,
    ports: [8080]
  });
});

test('returns normalized parse guidance for invalid JSON', () => {
  const result = validateSource({
    sourceText: '{"service": "api",}',
    sourceFormat: 'json'
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.line, 1);
  assert.ok(result.error.column > 0);
  assert.match(result.error.hint, /trailing comma|extra comma/i);
});

test('returns normalized parse guidance for invalid YAML', () => {
  const result = validateSource({
    sourceText: ['service api', 'enabled: true'].join('\n'),
    sourceFormat: 'yaml'
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.line, 1);
  assert.equal(result.error.column, 1);
  assert.match(result.error.hint, /colon|key\/value|separator/i);
});

test('does not produce partial output on parse failure', () => {
  const result = convertDocument({
    sourceText: '{oops}',
    sourceFormat: 'json',
    targetFormat: 'yaml',
    targetIndent: 2
  });

  assert.equal(result.ok, false);
  assert.equal(result.outputText, '');
});

test('bundled examples validate and convert in both directions', () => {
  for (const example of EXAMPLES) {
    const sourceFormat = example.format;
    const targetFormat = sourceFormat === 'json' ? 'yaml' : 'json';
    const result = convertDocument({
      sourceText: example.content,
      sourceFormat,
      targetFormat,
      targetIndent: 2
    });

    assert.equal(result.ok, true, `example ${example.id} should convert`);
  }
});
