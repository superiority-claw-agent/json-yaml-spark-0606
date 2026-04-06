import { convertDocument, validateSource } from './converter.js';
import { getExampleById } from './examples.js';

export const DIRECTION_CONFIG = {
  'json-to-yaml': {
    sourceFormat: 'json',
    targetFormat: 'yaml',
    sourceHeading: 'JSON input',
    targetHeading: 'YAML output',
    sourceHelp: 'Paste JSON to validate before converting it into YAML.',
    placeholder:
      'Paste JSON here, or open the Examples panel to load a working snippet.'
  },
  'yaml-to-json': {
    sourceFormat: 'yaml',
    targetFormat: 'json',
    sourceHeading: 'YAML input',
    targetHeading: 'JSON output',
    sourceHelp: 'Paste YAML here, or open the Examples panel to load a working snippet.',
    placeholder:
      'Paste YAML here, or open the Examples panel to load a working snippet.'
  }
};

export function createInitialState(preferences) {
  return {
    direction: 'json-to-yaml',
    preferences,
    sourceText: '',
    outputText: '',
    validation: {
      ok: null,
      error: null
    },
    examplesOpen: false,
    statusMessage: '',
    statusTone: 'neutral'
  };
}

export function getFormats(state) {
  return DIRECTION_CONFIG[state.direction];
}

export function getTargetIndent(state) {
  const { targetFormat } = getFormats(state);
  return targetFormat === 'json'
    ? state.preferences.jsonIndent
    : state.preferences.yamlIndent;
}

function getValidationStatus(validation) {
  if (validation.ok === false) {
    return {
      message: 'Source has parse errors. Fix the input before converting.',
      tone: 'error'
    };
  }

  if (validation.ok === true) {
    return {
      message: 'Input is valid',
      tone: 'success'
    };
  }

  return {
    message: '',
    tone: 'neutral'
  };
}

function withValidation(state) {
  const { sourceFormat } = getFormats(state);

  return {
    ...state,
    validation: validateSource({
      sourceText: state.sourceText,
      sourceFormat
    })
  };
}

function buildLocationText(error) {
  if (!error?.line || !error?.column) {
    return '';
  }

  return `Line ${error.line}, Column ${error.column}.`;
}

export function getValidationAnnouncement(validation) {
  if (validation.ok === false && validation.error) {
    const location = buildLocationText(validation.error);

    return [
      'Source has parse errors.',
      validation.error.summary,
      location,
      validation.error.hint
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (validation.ok === true) {
    return 'Input is valid and ready to convert.';
  }

  return '';
}

function withValidationStatus(state) {
  const { message, tone } = getValidationStatus(state.validation);

  return {
    ...state,
    statusMessage: message,
    statusTone: tone
  };
}

function getChangedValidationAnnouncement(previousValidation, nextValidation) {
  const previousAnnouncement = getValidationAnnouncement(previousValidation);
  const nextAnnouncement = getValidationAnnouncement(nextValidation);

  return nextAnnouncement && nextAnnouncement !== previousAnnouncement
    ? nextAnnouncement
    : '';
}

export function applySourceInput(state, sourceText) {
  const nextState = withValidationStatus(
    withValidation({
      ...state,
      sourceText
    })
  );

  return {
    nextState,
    announcement: getChangedValidationAnnouncement(state.validation, nextState.validation)
  };
}

export function applyDirectionChange(state, direction) {
  if (direction === state.direction) {
    return {
      nextState: state,
      announcement: ''
    };
  }

  const nextState = withValidation({
    ...state,
    direction,
    outputText: '',
    statusMessage: 'Direction changed. Previous output was cleared until you convert again.',
    statusTone: 'neutral'
  });
  const { sourceFormat, targetFormat } = getFormats(nextState);

  return {
    nextState,
    announcement: `Direction changed to ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}. Previous output was cleared until you convert again.`
  };
}

export function applyExampleLoad(state, exampleId) {
  const example = getExampleById(exampleId);

  if (!example) {
    return {
      nextState: state,
      announcement: ''
    };
  }

  const direction = example.format === 'json' ? 'json-to-yaml' : 'yaml-to-json';
  const nextState = withValidation({
    ...state,
    direction,
    sourceText: example.content,
    outputText: '',
    examplesOpen: false,
    statusMessage: `Loaded ${example.title}. Previous output was cleared until you convert again.`,
    statusTone: 'success'
  });

  return {
    nextState,
    announcement: `Loaded ${example.title}. Direction updated for ${example.format.toUpperCase()} input. Previous output was cleared until you convert again.`
  };
}

export function applyConvert(state) {
  const { sourceFormat, targetFormat } = getFormats(state);
  const result = convertDocument({
    sourceText: state.sourceText,
    sourceFormat,
    targetFormat,
    targetIndent: getTargetIndent(state)
  });

  if (!result.ok) {
    const nextState = {
      ...state,
      validation: {
        ok: false,
        error: result.error
      },
      statusMessage: 'Source has parse errors. Fix the input before converting.',
      statusTone: 'error'
    };

    return {
      nextState,
      announcement: getValidationAnnouncement(nextState.validation)
    };
  }

  return {
    nextState: {
      ...state,
      outputText: result.outputText,
      validation: {
        ok: true,
        error: null
      },
      statusMessage: `${targetFormat.toUpperCase()} output is ready.`,
      statusTone: 'success'
    },
    announcement: `${targetFormat.toUpperCase()} output is ready.`
  };
}
