# Live DSL Builder

An interactive web-based grammar editor for designing, testing, and visualizing Domain-Specific Languages (DSLs) using EBNF (Extended Backus-Naur Form) notation.

## What it does

Live DSL Builder lets you:

- Write grammar rules in multiple EBNF/BNF dialects
- Toggle individual grammar rules on/off to customize the syntax
- Validate test input against your grammar in real time
- Auto-generate valid example strings from the grammar
- Visualize grammar rules as interactive railroad diagrams (SVG)

It supports three standard grammar dialects: **BNF**, **EBNF-ISO** (ISO 14977), and **EBNF-W3C**.

## Getting started

```bash
cd live-dsl
npm install
npm run dev
```

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Features

### Grammar / EBNF editor
Write EBNF grammar rules in a Monaco-powered editor with syntax highlighting that adapts to whichever dialect rules are active.

### Rule toggling
The sidebar exposes 23 grammar rules across 9 categories. Toggle them individually to define the exact syntax your DSL supports:

| Category | Controls |
|---|---|
| Terminals | String literal style (`"..."`, `'...'`, `[a-z]`) |
| Nonterminals | Reference style (`<name>` vs bare `name`) |
| Definition | Rule syntax (`::=`, `=`, `<-`) |
| Alternation | Choice operator (`\|`, `/`, `or`) |
| Concatenation | Sequence mode (implicit or explicit `,`) |
| Quantifiers | Repetition (`*`, `+`, `?`) |
| Grouping | Wrapping constructs (`{}`, `[]`, `()`) |
| Terminators | Rule ending (`↵`, `;`, `.`) |
| Comments | Comment styles (`//`, `/* */`, `(* *)`) |

Conflicting rules auto-deactivate when toggled, and required categories always keep at least one rule active.

### DSL editor
Test input against your grammar. Errors are shown as inline squiggles with an error count in the panel header. Choose which grammar rule to validate against, or use the auto-detect mode.

### Railroad diagrams
Each grammar rule renders as an SVG railroad diagram. Clicking / hovering an element in the diagram highlights the corresponding source range in the EBNF editor.

### Generate
Click **Generate** to produce a random valid string from the grammar, or enable **Auto-generate** to regenerate automatically when you switch and change rules.

## Tech stack

- **React 19** + **TypeScript 5.9** - UI framework
- **Vite 7** - build tool
- **Monaco Editor** - embedded editor with syntax highlighting
- **Chevrotain** - parser library (lexer + parser for EBNF)
- **Railroad Diagrams** - SVG railroad diagram generation
- **Zustand** - state management
- **Tailwind CSS 4** + **shadcn/ui** - styling and components

## Project structure

```
live-dsl/src/
├── app/
│   └── store.ts              # Zustand store - all app state and actions
├── components/
│   ├── editor/
│   │   ├── ebnf-editor.tsx   # EBNF grammar editor
│   │   ├── dsl-editor-panel.tsx  # DSL test input editor
│   │   └── language/         # Monaco tokenizers and themes
│   ├── railroad-panel.tsx    # Railroad diagram panel
│   ├── AppSidebar.tsx        # Sidebar with rule toggles and presets
│   └── SiteHeader.tsx        # Header with panel visibility controls
├── grammar/
│   ├── rules.ts              # Rule definitions and preset configurations
│   ├── ebnf/                 # EBNF lexer, parser (Chevrotain), and AST builder
│   ├── dsl/                  # DSL tokenizer, validator, and string generator
│   └── visualization/        # AST-to-railroad-diagram converter
└── App.tsx                   # Root layout with resizable panels
```

## Status

This is a research project. The following features are currently placeholders:

- Parse Tree panel
- Reference panel
- Save & Share URL
- Code examples list
- Export as files
