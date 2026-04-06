import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyConvert,
  applyDirectionChange,
  applyExampleLoad,
  applySourceInput,
  createInitialState,
  getFormats
} from '../src/lib/app-state.js';
import { EXAMPLES } from '../src/lib/examples.js';
import { DEFAULT_PREFERENCES } from '../src/lib/preferences.js';

function createState() {
  return createInitialState({ ...DEFAULT_PREFERENCES });
}

test('clears converted output when the user changes direction', () => {
  const jsonExample = EXAMPLES.find((example) => example.format === 'json');
  let state = createState();

  state = applySourceInput(state, jsonExample.content).nextState;
  state = applyConvert(state).nextState;

  assert.match(state.outputText, /^service:/m);

  const { nextState, announcement } = applyDirectionChange(state, 'yaml-to-json');

  assert.equal(nextState.outputText, '');
  assert.equal(nextState.direction, 'yaml-to-json');
  assert.equal(getFormats(nextState).targetFormat, 'json');
  assert.match(announcement, /Previous output was cleared until you convert again/i);
});

test('clears converted output when loading an example and switches to the example direction', () => {
  const jsonExample = EXAMPLES.find((example) => example.format === 'json');
  const yamlExample = EXAMPLES.find((example) => example.format === 'yaml');
  let state = {
    ...createState(),
    examplesOpen: true
  };

  state = applySourceInput(state, jsonExample.content).nextState;
  state = applyConvert(state).nextState;

  assert.notEqual(state.outputText, '');

  const { nextState, announcement } = applyExampleLoad(state, yamlExample.id);

  assert.equal(nextState.outputText, '');
  assert.equal(nextState.direction, 'yaml-to-json');
  assert.equal(nextState.sourceText, yamlExample.content);
  assert.equal(nextState.examplesOpen, false);
  assert.equal(nextState.validation.ok, true);
  assert.match(announcement, /Direction updated for YAML input/i);
});

test('announces validation feedback during typing when the validation state changes', () => {
  let state = createState();

  let result = applySourceInput(state, '{"service": "api",}');

  assert.equal(result.nextState.validation.ok, false);
  assert.match(result.announcement, /Source has parse errors/i);
  assert.match(result.announcement, /Line 1, Column/i);

  state = result.nextState;
  result = applySourceInput(state, '{"service":"api"}');

  assert.equal(result.nextState.validation.ok, true);
  assert.equal(result.nextState.statusMessage, 'Input is valid');
  assert.equal(result.announcement, 'Input is valid and ready to convert.');
});
