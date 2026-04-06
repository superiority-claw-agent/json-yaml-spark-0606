export const STORAGE_KEY = 'json-yaml-spark:preferences';
export const INDENT_OPTIONS = [2, 4];

export const DEFAULT_PREFERENCES = Object.freeze({
  jsonIndent: 2,
  yamlIndent: 2
});

function isValidIndent(value) {
  return INDENT_OPTIONS.includes(value);
}

export function normalizePreferences(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return { ...DEFAULT_PREFERENCES };
  }

  const jsonIndent = Number(candidate.jsonIndent);
  const yamlIndent = Number(candidate.yamlIndent);

  if (!isValidIndent(jsonIndent) || !isValidIndent(yamlIndent)) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    jsonIndent,
    yamlIndent
  };
}

export function createMemoryStorage(seed = {}) {
  const store = new Map(Object.entries(seed));

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    }
  };
}

export function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPreferences(storage = getBrowserStorage()) {
  if (!storage) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    return normalizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(storage = getBrowserStorage(), preferences) {
  const normalized = normalizePreferences(preferences);

  if (!storage) {
    return normalized;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    return normalized;
  }

  return normalized;
}
