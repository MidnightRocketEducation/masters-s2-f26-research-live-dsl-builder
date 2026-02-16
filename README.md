
# EBNF Live Parse Tree

This is a live EBNF parser prototype: edit grammar text on the left and see a parse tree on the right. It provides immediate feedback and bidirectional interaction—click a tree node to highlight its source span in the editor.

## How it works

1. Monaco captures editor changes.
2. RxJS debounces changes and triggers parsing.
3. ANTLR (JS target) lexes/parses the EBNF text into a parse tree.
4. The tree is mapped into a D3-friendly structure with token ranges.
5. D3 renders a zoomable tree; clicking nodes highlights source ranges in Monaco.

The tree can be toggled between a full parse tree and a compact view that collapses single-child rule nodes.

## ANTLR grammar definition

The grammar is defined in `grammar/EBNF.g4` and is now based on the [ANTLR grammars-v4 EBNF grammar](https://github.com/antlr/grammars-v4/blob/master/ebnf/bnf.g4):

- **Rules**: Each rule describes a syntactic construct (e.g., `rule_`, `alternatives`, `element`).
- **Tokens**: Terminals like `ID`, punctuation, and assignment are defined as lexer rules.
- **Operators**: EBNF operators (`|`, `{}`, `[]`, `()`, `::=`) are handled as tokens and rule alternatives.
- **Productions**: Rules can reference other rules, groupings, and options (parentheses, brackets, braces).
- **Whitespace/comments**: Skipped via lexer rules (`WS`).

This grammar is more comprehensive and compatible with standard EBNF, supporting a wider range of EBNF syntax and constructs.

## Tool roles in this project

- **Vite**: Dev server and bundler for fast reloads and production builds.
- **Monaco Editor**: Code editor surface (syntax highlighting, selection, and decorations).
- **ANTLR (JS target)**: EBNF lexer/parser generation; runtime creates parse trees.
- **RxJS**: Liveness loop—streams editor changes, debounces, and triggers parsing.
- **D3**: Tree layout and rendering; handles pan/zoom and node click interactions.
- **EBNF.g4**: ANTLR grammar rules for EBNF, from their official repository; Enables meta-DSL.

## Getting started

```bash
npm install
```

Generate the ANTLR parser (requires Java on PATH; the script auto-downloads the ANTLR jar):

```bash
npm run antlr
```

Start the dev server:

```bash
npm run dev
```

## Files

- `grammar/EBNF.g4`: EBNF grammar from the offial ANTLR repo
- `scripts/antlr.js`: downloads and runs the ANTLR tool
- `src/parser.js`: ANTLR parse pipeline and tree extraction (compact toggle)
- `src/visual.js`: D3 tree layout renderer with zoom/pan
- `src/editor.js`: Monaco editor setup + highlighting
- `src/stream.js`: RxJS debounced parse stream
- `src/main.js`: wiring of editor, parser, and visualization
