import { copyText } from './lib/clipboard.js';
import { convertDocument, validateSource } from './lib/converter.js';
import { EXAMPLES, getExampleById } from './lib/examples.js';
import {
  INDENT_OPTIONS,
  loadPreferences,
  savePreferences
} from './lib/preferences.js';

const DIRECTION_CONFIG = {
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
    sourceHelp: 'Paste YAML to validate before converting it into JSON.',
    placeholder:
      'Paste YAML here, or open the Examples panel to load a working snippet.'
  }
};

const state = {
  direction: 'json-to-yaml',
  preferences: loadPreferences(),
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

const elements = {
  directionButtons: Array.from(document.querySelectorAll('[data-direction]')),
  indentSelect: document.querySelector('#indent-select'),
  indentLabel: document.querySelector('#indent-label'),
  convertButton: document.querySelector('#convert-button'),
  toggleExamplesButton: document.querySelector('#toggle-examples'),
  examplesPanel: document.querySelector('#examples-panel'),
  exampleList: document.querySelector('#example-list'),
  sourceHeading: document.querySelector('#source-heading'),
  sourceHelp: document.querySelector('#source-help'),
  sourceInput: document.querySelector('#source-input'),
  outputHeading: document.querySelector('#output-heading'),
  outputText: document.querySelector('#output-text'),
  outputFooter: document.querySelector('#output-footer'),
  copyButton: document.querySelector('#copy-button'),
  validationChip: document.querySelector('#validation-chip'),
  toolbarNote: document.querySelector('#toolbar-note'),
  errorPanel: document.querySelector('#error-panel'),
  errorLocation: document.querySelector('#error-location'),
  errorSummary: document.querySelector('#error-summary'),
  errorHint: document.querySelector('#error-hint'),
  errorRaw: document.querySelector('#error-raw'),
  liveRegion: document.querySelector('#live-region')
};

function announce(message) {
  elements.liveRegion.textContent = '';
  window.setTimeout(() => {
    elements.liveRegion.textContent = message;
  }, 10);
}

function getFormats() {
  return DIRECTION_CONFIG[state.direction];
}

function getTargetIndent() {
  const { targetFormat } = getFormats();
  return targetFormat === 'json'
    ? state.preferences.jsonIndent
    : state.preferences.yamlIndent;
}

function setDirection(direction, announceChange = false) {
  state.direction = direction;
  updateValidation();

  if (announceChange) {
    const { sourceFormat, targetFormat } = getFormats();
    announce(`Direction changed to ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}.`);
  }

  render();
}

function updateValidation() {
  const { sourceFormat } = getFormats();
  state.validation = validateSource({
    sourceText: state.sourceText,
    sourceFormat
  });
}

function setStatus(message, tone = 'neutral', shouldAnnounce = false) {
  state.statusMessage = message;
  state.statusTone = tone;

  if (shouldAnnounce) {
    announce(message);
  }
}

function handleSourceInput(event) {
  state.sourceText = event.target.value;
  updateValidation();

  if (state.validation.ok === false) {
    setStatus('Source has parse errors. Fix the input before converting.', 'error');
  } else if (state.validation.ok === true) {
    setStatus('Input is valid', 'success');
  } else {
    setStatus('', 'neutral');
  }

  render();
}

async function handleCopy() {
  const result = await copyText(state.outputText);
  const tone = result.ok ? 'success' : 'error';
  setStatus(result.message, tone, true);
  render();
}

function handleConvert() {
  const { sourceFormat, targetFormat } = getFormats();
  const result = convertDocument({
    sourceText: state.sourceText,
    sourceFormat,
    targetFormat,
    targetIndent: getTargetIndent()
  });

  if (!result.ok) {
    state.validation = {
      ok: false,
      error: result.error
    };
    setStatus('Source has parse errors. Fix the input before converting.', 'error', true);
    render();
    return;
  }

  state.outputText = result.outputText;
  state.validation = {
    ok: true,
    error: null
  };
  setStatus(`${targetFormat.toUpperCase()} output is ready.`, 'success', true);
  render();
}

function handleIndentChange(event) {
  const value = Number(event.target.value);
  const { targetFormat } = getFormats();
  const nextPreferences = {
    ...state.preferences,
    ...(targetFormat === 'json'
      ? { jsonIndent: value }
      : { yamlIndent: value })
  };

  state.preferences = savePreferences(undefined, nextPreferences);
  setStatus(`${targetFormat.toUpperCase()} indentation saved for this browser.`, 'neutral');
  render();
}

function handleExampleLoad(exampleId) {
  const example = getExampleById(exampleId);

  if (!example) {
    return;
  }

  const nextDirection = example.format === 'json' ? 'json-to-yaml' : 'yaml-to-json';
  state.direction = nextDirection;
  state.sourceText = example.content;
  state.examplesOpen = false;
  updateValidation();
  setStatus(
    `Loaded ${example.title}. Direction updated for ${example.format.toUpperCase()} input.`,
    'success',
    true
  );
  render();
}

function renderExamples() {
  elements.exampleList.innerHTML = '';

  for (const example of EXAMPLES) {
    const article = document.createElement('article');
    article.className = 'example-card';
    article.innerHTML = `
      <div class="example-card-header">
        <div>
          <span class="example-badge">${example.format.toUpperCase()}</span>
          <h3>${example.title}</h3>
        </div>
        <button type="button" class="ghost-button" data-example-id="${example.id}">
          Load
        </button>
      </div>
      <p>${example.description}</p>
    `;
    elements.exampleList.append(article);
  }

  for (const button of elements.exampleList.querySelectorAll('[data-example-id]')) {
    button.addEventListener('click', () => handleExampleLoad(button.dataset.exampleId));
  }
}

function render() {
  const config = getFormats();
  const currentIndent = getTargetIndent();

  for (const button of elements.directionButtons) {
    const isActive = button.dataset.direction === state.direction;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  }

  elements.sourceHeading.textContent = config.sourceHeading;
  elements.sourceHelp.textContent = config.sourceHelp;
  elements.outputHeading.textContent = config.targetHeading;
  elements.sourceInput.placeholder = config.placeholder;
  elements.sourceInput.value = state.sourceText;
  elements.outputText.value = state.outputText;

  elements.indentLabel.textContent = `${config.targetFormat.toUpperCase()} indentation`;
  elements.indentSelect.innerHTML = INDENT_OPTIONS.map(
    (indent) => `<option value="${indent}">${indent} spaces</option>`
  ).join('');
  elements.indentSelect.value = String(currentIndent);

  elements.examplesPanel.hidden = !state.examplesOpen;
  elements.toggleExamplesButton.setAttribute('aria-expanded', String(state.examplesOpen));
  elements.toggleExamplesButton.textContent = state.examplesOpen ? 'Hide examples' : 'Examples';

  elements.copyButton.disabled = !state.outputText;

  if (state.validation.ok === true) {
    elements.validationChip.textContent = 'Input is valid';
    elements.validationChip.className = 'status-chip success';
  } else if (state.validation.ok === false) {
    elements.validationChip.textContent = 'Input could not be parsed';
    elements.validationChip.className = 'status-chip error';
  } else {
    elements.validationChip.textContent = 'Paste JSON or YAML, or load an example to start';
    elements.validationChip.className = 'status-chip';
  }

  if (state.statusMessage) {
    elements.toolbarNote.textContent = state.statusMessage;
    elements.toolbarNote.className = `toolbar-note ${state.statusTone}`;
  } else {
    elements.toolbarNote.textContent = 'Target format settings persist in this browser.';
    elements.toolbarNote.className = 'toolbar-note';
  }

  if (state.validation.ok === false && state.validation.error) {
    const { line, column, summary, hint, rawMessage } = state.validation.error;
    elements.errorPanel.hidden = false;
    elements.errorLocation.textContent =
      line && column ? `Line ${line}, Column ${column}` : 'Location unavailable';
    elements.errorSummary.textContent = summary;
    elements.errorHint.textContent = `${hint} Try fixing the shown line or load an example to compare the expected shape.`;
    elements.errorRaw.textContent = rawMessage;
  } else {
    elements.errorPanel.hidden = true;
  }

  if (state.validation.ok === false && state.outputText) {
    elements.outputFooter.textContent =
      'Showing the last successful output. Fix the source and convert again when ready.';
  } else if (state.outputText) {
    elements.outputFooter.textContent =
      `${config.targetFormat.toUpperCase()} output is formatted with your saved indentation setting.`;
  } else {
    elements.outputFooter.textContent =
      'Output stays in place until the next successful conversion.';
  }

  elements.convertButton.disabled = state.validation.ok !== true;
}

function bindEvents() {
  for (const button of elements.directionButtons) {
    button.addEventListener('click', () => setDirection(button.dataset.direction, true));
  }

  elements.sourceInput.addEventListener('input', handleSourceInput);
  elements.convertButton.addEventListener('click', handleConvert);
  elements.copyButton.addEventListener('click', handleCopy);
  elements.indentSelect.addEventListener('change', handleIndentChange);
  elements.toggleExamplesButton.addEventListener('click', () => {
    state.examplesOpen = !state.examplesOpen;
    render();
  });
}

renderExamples();
bindEvents();
updateValidation();
render();
