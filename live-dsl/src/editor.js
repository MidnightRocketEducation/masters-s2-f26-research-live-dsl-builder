import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// Configure Monaco to use the correct worker in browser environments
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

// Default editor options for Monaco
const DEFAULT_OPTIONS = {
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
};

/**
 * Create and initialize a Monaco editor instance.
 * @param {HTMLElement} container - The DOM node to mount the editor in.
 * @param {string} initialValue - The initial text value for the editor.
 * @returns {monaco.editor.IStandaloneCodeEditor}
 */
export function createEditor(container, initialValue) {
  const editor = monaco.editor.create(container, {
    value: initialValue,
    language: 'plaintext',
    theme: 'vs-dark',
    ...DEFAULT_OPTIONS,
  });
  return editor;
}

// Track active highlight decorations for clearing
let activeDecorations = [];

/**
 * Highlight a range in the Monaco editor (used for bidirectional linking from tree to code).
 * @param {monaco.editor.IStandaloneCodeEditor} editor
 * @param {object|null} range - { startLineNumber, startColumn, endLineNumber, endColumn }
 */
export function highlightRange(editor, range) {
  if (!range) {
    activeDecorations = editor.deltaDecorations(activeDecorations, []);
    return;
  }

  const decoration = {
    range: new monaco.Range(
      range.startLineNumber,
      range.startColumn,
      range.endLineNumber,
      range.endColumn,
    ),
    options: {
      inlineClassName: 'token-highlight',
      className: 'token-highlight-line',
    },
  };

  activeDecorations = editor.deltaDecorations(activeDecorations, [decoration]);
  editor.revealRangeInCenter(decoration.range);
}
