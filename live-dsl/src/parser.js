
// ANTLR parse pipeline: loads generated parser, parses EBNF, builds tree for D3, supports compact/full view
import antlr4 from 'antlr4';

let generatedCache = null;

/**
 * Dynamically import generated ANTLR lexer and parser modules (cached).
 * @returns {Promise<{Lexer: any, Parser: any}>}
 */
async function loadGenerated() {
  if (generatedCache) {
    return generatedCache;
  }

  const [lexerModule, parserModule] = await Promise.all([
    import('./generated/EBNFLexer.js'),
    import('./generated/EBNFParser.js'),
  ]);

  generatedCache = {
    Lexer: lexerModule.default ?? lexerModule.EBNFLexer,
    Parser: parserModule.default ?? parserModule.EBNFParser,
  };

  return generatedCache;
}

/**
 * Custom error listener to collect syntax errors from ANTLR parser.
 */
class CollectingErrorListener extends antlr4.error.ErrorListener {
  constructor(errors) {
    super();
    this.errors = errors;
  }

  syntaxError(recognizer, offendingSymbol, line, column, message) {
    this.errors.push(`Line ${line}:${column + 1} ${message}`);
  }
}

/**
 * Convert ANTLR token positions to Monaco-compatible range object.
 */
function tokenToRange(startToken, stopToken) {
  if (!startToken || !stopToken) {
    return null;
  }

  const startLineNumber = startToken.line || 1;
  const startColumn = (startToken.column ?? 0) + 1;
  const endLineNumber = stopToken.line || startLineNumber;
  const tokenLength = stopToken.text ? stopToken.text.length : 1;
  const endColumn = (stopToken.column ?? 0) + tokenLength + 1;

  return {
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
  };
}

/**
 * Recursively build a tree from ANTLR parse tree for D3 rendering.
 * @param {object} node - ANTLR parse tree node
 * @param {object} parser - ANTLR parser instance
 * @param {function} nextId - ID generator
 * @returns {object} D3-friendly tree node
 */
function buildTree(node, parser, nextId) {
  const id = nextId();

  if (node.symbol) {
    const tokenText = node.getText();
    return {
      id,
      type: 'terminal',
      label: tokenText,
      range: tokenToRange(node.symbol, node.symbol),
      children: [],
    };
  }

  const ruleName = parser.ruleNames?.[node.ruleIndex] ?? 'rule';
  const children = (node.children || []).map((child) => buildTree(child, parser, nextId));

  return {
    id,
    type: 'rule',
    label: ruleName,
    range: tokenToRange(node.start, node.stop),
    children,
  };
}

/**
 * Collapse single-child rule nodes for a compact tree view.
 * @param {object} node
 * @returns {object|null}
 */
function compactTree(node) {
  if (!node) {
    return null;
  }

  if (!node.children || node.children.length === 0) {
    return node;
  }

  const children = node.children.map(compactTree).filter(Boolean);
  const compacted = { ...node, children };

  if (compacted.type === 'rule' && compacted.children.length === 1) {
    return compacted.children[0];
  }

  return compacted;
}

/**
 * Parse EBNF text using ANTLR, return tree and errors.
 * @param {string} text
 * @param {object} options - { compact: boolean }
 * @returns {Promise<{tree: object|null, errors: string[]}>}
 */
export async function parseEbnf(text, options = { compact: true }) {
  const errors = [];

  let Lexer;
  let Parser;

  try {
    ({ Lexer, Parser } = await loadGenerated());
  } catch (error) {
    return {
      tree: {
        id: 'root-missing',
        label: 'Parser not generated',
        type: 'rule',
        range: null,
        children: [],
      },
      errors: [
        'ANTLR parser not generated. Run: npm run antlr',
        error instanceof Error ? error.message : String(error),
      ],
    };
  }

  if (Lexer?.isStub || Parser?.isStub) {
    return {
      tree: {
        id: 'root-stub',
        label: 'Parser not generated',
        type: 'rule',
        range: null,
        children: [],
      },
      errors: ['ANTLR parser not generated. Run: npm run antlr'],
    };
  }

  const input = antlr4.CharStreams.fromString(text);
  const lexer = new Lexer(input);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new Parser(tokens);
  parser.buildParseTrees = true;

  const errorListener = new CollectingErrorListener(errors);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  let tree;
  try {
    // grammars-v4 EBNF.g4 entry point is rulelist
    tree = parser.rulelist();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const idFactory = (() => {
    let current = 0;
    return () => `node-${current++}`;
  })();

  const rawTree = tree ? buildTree(tree, parser, idFactory) : null;
  const compactedTree = options?.compact ? compactTree(rawTree) : rawTree;

  return {
    tree: compactedTree,
    errors,
  };
}
