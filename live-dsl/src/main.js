
// Main entry point: wires up Monaco, ANTLR parse pipeline, RxJS liveness, and D3 tree rendering
import './style.css';
import { createEditor, highlightRange } from './editor.js';
import { createParseStream } from './stream.js';
import { renderTree } from './visual.js';
import { fromEvent, map, startWith } from 'rxjs';


// DOM node references
const editorEl = document.querySelector('#editor');
const treeEl = document.querySelector('#tree');
const statusEl = document.querySelector('#status');
const compactToggle = document.querySelector('#toggle-compact');


// Ensure all required DOM nodes exist
if (!editorEl || !treeEl || !statusEl) {
  throw new Error('Missing required DOM nodes for editor or tree.');
}
if (!compactToggle) {
  throw new Error('Missing compact toggle checkbox.');
}


// Set initial status
statusEl.textContent = 'Initializing…';


// Example EBNF input compatible with grammars-v4 EBNF.g4
const initialValue =  `<expr> ::= <term> | <expr> "+" <term> | <expr> "-" <term>
<term> ::= <factor> | <term> "*" <factor> | <term> "/" <factor>
<factor> ::= <id> | "(" <expr> ")"
<id> ::= ID
`;


// Initialize Monaco editor
let editor;
try {
  editor = createEditor(editorEl, initialValue);
  statusEl.textContent = 'Editor ready';
} catch (error) {
  statusEl.textContent = error instanceof Error ? error.message : String(error);
  statusEl.classList.add('status-error');
  throw error;
}


// Store last parse tree for re-rendering on resize
let lastTree = null;


/**
 * Recursively count nodes in a tree (for status display)
 */
function countNodes(node) {
  if (!node) return 0;
  return 1 + (node.children || []).reduce((sum, child) => sum + countNodes(child), 0);
}


// Observable for compact/full tree toggle
const options$ = fromEvent(compactToggle, 'change').pipe(
  startWith(null),
  map(() => ({ compact: compactToggle.checked })),
);


// Main liveness loop: parse on editor or toggle change, update tree and status
createParseStream(editor, options$).subscribe(({ tree, errors }) => {
  lastTree = tree;
  renderTree(treeEl, tree, {
    onNodeClick: (node) => highlightRange(editor, node.range),
  });

  if (errors.length) {
    statusEl.textContent = errors[0];
    statusEl.classList.add('status-error');
  } else {
    const nodeCount = countNodes(tree);
    statusEl.textContent = `Parsed successfully · nodes: ${nodeCount}`;
    statusEl.classList.remove('status-error');
  }
});


// Show runtime errors in the status pill
window.addEventListener('error', (event) => {
  statusEl.textContent = event?.error?.message || event.message || 'Runtime error';
  statusEl.classList.add('status-error');
});


// Re-render tree on window resize
window.addEventListener('resize', () => {
  if (lastTree) {
    renderTree(treeEl, lastTree, {
      onNodeClick: (node) => highlightRange(editor, node.range),
    });
  }
});
