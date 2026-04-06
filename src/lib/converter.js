import YAML from 'yaml';

function offsetToLineColumn(sourceText, offset) {
  const safeOffset = Math.max(0, Math.min(offset, sourceText.length));
  const upToOffset = sourceText.slice(0, safeOffset);
  const lines = upToOffset.split('\n');

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function normalizeJsonError(error, sourceText) {
  const message = error instanceof Error ? error.message : 'JSON parsing failed.';
  const lineColumnMatch = message.match(/\(line (\d+) column (\d+)\)/i);
  const positionMatch = message.match(/position (\d+)/i);
  const location = lineColumnMatch
    ? {
        line: Number(lineColumnMatch[1]),
        column: Number(lineColumnMatch[2])
      }
    : positionMatch
      ? offsetToLineColumn(sourceText, Number(positionMatch[1]))
      : { line: null, column: null };

  let hint = 'Check the highlighted area for a missing comma, brace, or quote.';

  if (/double-quoted property name|expected property name/i.test(message)) {
    hint =
      'This often points to an extra comma or an unquoted key. Remove any trailing comma and keep JSON keys in double quotes.';
  } else if (/unterminated string/i.test(message)) {
    hint = 'A string is missing its closing double quote.';
  } else if (/after property value|after array element/i.test(message)) {
    hint = 'Check for a missing comma between properties or array items.';
  } else if (/unexpected non-whitespace/i.test(message)) {
    hint = 'There is extra text after the end of the JSON value.';
  }

  return {
    line: location.line,
    column: location.column,
    summary: 'The JSON source is not valid yet.',
    hint,
    rawMessage: message
  };
}

function normalizeYamlError(error) {
  const rawMessage = error?.message || 'YAML parsing failed.';
  const line = error?.linePos?.[0]?.line || null;
  const column = error?.linePos?.[0]?.col || null;
  const firstLine = rawMessage.split('\n')[0];
  let hint =
    'Check the shown line for a missing colon, inconsistent indentation, or a misplaced list marker.';

  if (/implicit keys|key/i.test(rawMessage)) {
    hint =
      'A YAML key likely needs a ":" separator. Check the current line for a missing key/value colon.';
  } else if (/indent/i.test(rawMessage)) {
    hint = 'YAML indentation controls structure. Align nested keys and list items consistently.';
  } else if (/flow/i.test(rawMessage)) {
    hint = 'Check commas, brackets, and braces near the current line.';
  }

  return {
    line,
    column,
    summary: firstLine,
    hint,
    rawMessage
  };
}

function parseJson(sourceText) {
  try {
    return {
      ok: true,
      value: JSON.parse(sourceText)
    };
  } catch (error) {
    return {
      ok: false,
      error: normalizeJsonError(error, sourceText)
    };
  }
}

function parseYaml(sourceText) {
  const lineCounter = new YAML.LineCounter();
  const document = YAML.parseDocument(sourceText, {
    lineCounter,
    prettyErrors: true,
    merge: true
  });

  if (document.errors.length > 0) {
    return {
      ok: false,
      error: normalizeYamlError(document.errors[0])
    };
  }

  return {
    ok: true,
    value: document.toJS()
  };
}

function parseSource(sourceText, sourceFormat) {
  return sourceFormat === 'json' ? parseJson(sourceText) : parseYaml(sourceText);
}

export function validateSource({ sourceText, sourceFormat }) {
  if (!sourceText.trim()) {
    return {
      ok: null,
      error: null
    };
  }

  return parseSource(sourceText, sourceFormat);
}

export function convertDocument({
  sourceText,
  sourceFormat,
  targetFormat,
  targetIndent
}) {
  const parsed = parseSource(sourceText, sourceFormat);

  if (!parsed.ok) {
    return {
      ok: false,
      outputText: '',
      error: parsed.error
    };
  }

  const outputText =
    targetFormat === 'json'
      ? JSON.stringify(parsed.value, null, targetIndent)
      : YAML.stringify(parsed.value, {
          indent: targetIndent
        }).trimEnd();

  return {
    ok: true,
    outputText,
    error: null
  };
}
