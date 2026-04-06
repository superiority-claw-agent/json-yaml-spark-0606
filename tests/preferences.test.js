import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PREFERENCES,
  createMemoryStorage,
  loadPreferences,
  savePreferences
} from '../src/lib/preferences.js';

test('loads safe defaults when storage is empty', () => {
  const storage = createMemoryStorage();

  assert.deepEqual(loadPreferences(storage), DEFAULT_PREFERENCES);
});

test('persists and restores valid indentation preferences', () => {
  const storage = createMemoryStorage();

  savePreferences(storage, {
    jsonIndent: 4,
    yamlIndent: 4
  });

  assert.deepEqual(loadPreferences(storage), {
    jsonIndent: 4,
    yamlIndent: 4
  });
});

test('falls back to defaults when persisted preferences are invalid', () => {
  const storage = createMemoryStorage({
    'json-yaml-spark:preferences': '{"jsonIndent":3,"yamlIndent":"wide"}'
  });

  assert.deepEqual(loadPreferences(storage), DEFAULT_PREFERENCES);
});
