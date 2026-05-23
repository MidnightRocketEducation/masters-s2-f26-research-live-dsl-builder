import {
  CstParser as ChevCstParser,
  type CstNode as ChevCstNode,
  type IToken,
  type TokenType,
} from "chevrotain"
import { buildLexer, type TokenAccessor } from "./lexer"
import type { CstNode, ParseError, ParseResult, SourceRange, AstRule } from "@/grammar/types"
import { cstToAst } from "./ast"
/*
  parser.ts

  A Chevrotain CstParser that adapts its grammar rules at construction time
  based on the set of active rule IDs.

  Because Chevrotain requires grammar rules to be defined in the constructor,
  we rebuild the parser class instance whenever the active rule set changes.
  The lexer (and therefore the token set) is also rebuilt at the same time.
  This rebuild only happens when rules are toggled - not on every keystroke.
*/


// ----------------------------------------------------------------------
// GrammarCstParser extends Chevrotain's CstParser and defines our grammar rules.
// ----------------------------------------------------------------------
class GrammarCstParser extends ChevCstParser {
  private T: TokenAccessor
  private active: Set<string>

  grammar!: () => ChevCstNode
  ruleDefinition!: () => ChevCstNode
  lhs!: () => ChevCstNode
  rhs!: () => ChevCstNode
  alternative!: () => ChevCstNode
  item!: () => ChevCstNode
  atom!: () => ChevCstNode
  group!: () => ChevCstNode
  repetitionWrap!: () => ChevCstNode
  optionalWrap!: () => ChevCstNode
  nonterminalRef!: () => ChevCstNode
  terminalRef!: () => ChevCstNode

  constructor(allTokens: TokenType[], T: TokenAccessor, active: Set<string>) {
    super(allTokens, {
      maxLookahead: 3,
      errorMessageProvider: {
        buildMismatchTokenMessage: ({ expected, actual }) =>
          `Expected ${expected.name} but found "${actual.image}"`,
        buildNotAllInputParsedMessage: ({ firstRedundant }) =>
          `Unexpected token "${firstRedundant.image}"`,
        buildNoViableAltMessage: ({ expectedPathsPerAlt }) =>
          `No viable alternative. Expected one of: ${expectedPathsPerAlt
            .flat()
            .map(p => p.map(t => t.name).join(" "))
            .join(" | ")}`,
        buildEarlyExitMessage: ({ expectedIterationPaths }) =>
          `Expected at least one of: ${expectedIterationPaths
            .map(p => p.map(t => t.name).join(" "))
            .join(" | ")}`,
      },
    })

    this.T = T
    this.active = active
    this.#defineGrammar()
    this.performSelfAnalysis()
  }

  #defineGrammar() {
    const self = this
    const T = this.T
    const active = this.active

    const altToken: TokenType | null = T.PIPE ?? T.SLASH ?? T.OR_KW ?? null
    const defineToken: TokenType | null = T.DEFINE_BNF ?? T.DEFINE_ISO ?? T.DEFINE_ARROW ?? null

    const useNewline   = active.has("terminator-newline")
    const useSemicolon = active.has("terminator-semicolon")
    const usePeriod    = active.has("terminator-period")
    const useComma     = active.has("concat-comma")

    // --- grammar --------------------------------------------------------------
    self.RULE("grammar", () => {
      self.MANY(() => {
        self.MANY2(() => self.CONSUME(T.NEWLINE))
        self.SUBRULE(self.ruleDefinition)
      })
      self.MANY3(() => self.CONSUME2(T.NEWLINE))
    })


    // --- ruleDefinition -------------------------------------------------------
    self.RULE("ruleDefinition", () => {
      self.SUBRULE(self.lhs)
      if (defineToken) self.CONSUME(defineToken)
      self.SUBRULE(self.rhs)

      if (useSemicolon && T.SEMICOLON) {
        self.CONSUME(T.SEMICOLON)
      } else if (usePeriod && T.PERIOD) {
        self.CONSUME(T.PERIOD)
      } else if (useNewline) {
        self.MANY(() => self.CONSUME(T.NEWLINE))
      }
    })

    // --- lhs ------------------------------------------------------------------
    self.RULE("lhs", () => {
      self.SUBRULE(self.nonterminalRef)
    })

    // --- rhs ------------------------------------------------------------------
    self.RULE("rhs", () => {
      self.SUBRULE(self.alternative)
      if (altToken) {
        self.MANY(() => {
          self.CONSUME(altToken)
          self.SUBRULE2(self.alternative)
        })
      }
    })

    // --- alternative ----------------------------------------------------------
    self.RULE("alternative", () => {
      self.SUBRULE(self.item)
      self.MANY(() => {
        if (useComma && T.COMMA) self.CONSUME(T.COMMA)
        self.SUBRULE2(self.item)
      })
    })

    // --- item -----------------------------------------------------------------
    // item = atom quantifier? ("- " atom)*
    // Exception is left-associative and looser than quantifiers.
    self.RULE("item", () => {
      self.SUBRULE(self.atom)
      self.OPTION(() => {
        self.OR([
          ...(T.STAR     ? [{ ALT: () => self.CONSUME(T.STAR!)     }] : []),
          ...(T.PLUS     ? [{ ALT: () => self.CONSUME(T.PLUS!)     }] : []),
          ...(T.QUESTION ? [{ ALT: () => self.CONSUME(T.QUESTION!) }] : []),
        ])
      })
      // Zero or more exception clauses - only when operator-exception is active
      if (T.EXCEPT) {
        self.MANY(() => {
          self.CONSUME(T.EXCEPT!)
          self.SUBRULE2(self.atom)
        })
      }
    })

    // --- atom -----------------------------------------------------------------
    self.RULE("atom", () => {
      self.OR([
        ...(T.LPAREN   ? [{ ALT: () => self.SUBRULE(self.group)          }] : []),
        ...(T.LBRACE   ? [{ ALT: () => self.SUBRULE(self.repetitionWrap) }] : []),
        ...(T.LBRACKET ? [{ ALT: () => self.SUBRULE(self.optionalWrap)   }] : []),
        { ALT: () => self.SUBRULE(self.terminalRef)    },
        { ALT: () => self.SUBRULE(self.nonterminalRef) },
      ])
    })

    // --- group ----------------------------------------------------------------
    self.RULE("group", () => {
      if (T.LPAREN && T.RPAREN) {
        self.CONSUME(T.LPAREN)
        self.SUBRULE(self.rhs)
        self.CONSUME(T.RPAREN)
      }
    })

    // --- repetitionWrap -------------------------------------------------------
    self.RULE("repetitionWrap", () => {
      if (T.LBRACE && T.RBRACE) {
        self.CONSUME(T.LBRACE)
        self.SUBRULE(self.rhs)
        self.CONSUME(T.RBRACE)
      }
    })

    // --- optionalWrap ---------------------------------------------------------
    self.RULE("optionalWrap", () => {
      if (T.LBRACKET && T.RBRACKET) {
        self.CONSUME(T.LBRACKET)
        self.SUBRULE(self.rhs)
        self.CONSUME(T.RBRACKET)
      }
    })

    // --- terminalRef ----------------------------------------------------------
    self.RULE("terminalRef", () => {
      const alts = [
        ...(T.STRING_DOUBLE ? [{ ALT: () => self.CONSUME(T.STRING_DOUBLE!) }] : []),
        ...(T.STRING_SINGLE ? [{ ALT: () => self.CONSUME(T.STRING_SINGLE!) }] : []),
        ...(T.CHARCLASS     ? [{ ALT: () => self.CONSUME(T.CHARCLASS!)     }] : []),
      ]
      if (alts.length > 0) self.OR(alts)
    })

    // --- nonterminalRef -------------------------------------------------------
    self.RULE("nonterminalRef", () => {
      const alts = [
        ...(T.ANGLED_IDENT ? [{ ALT: () => self.CONSUME(T.ANGLED_IDENT!) }] : []),
        ...(T.SPACED_IDENT ? [{ ALT: () => self.CONSUME(T.SPACED_IDENT!) }] : []),
      ]
      if (alts.length > 0) self.OR(alts)
    })
  }
}



// ----------------------------------------------------------------------
// CHEVROTAIN CST -> Custom CST
// ----------------------------------------------------------------------
const KIND_MAP: Record<string, CstNode["kind"]> = {
  grammar:        "grammar",
  ruleDefinition: "rule-definition",
  lhs:            "lhs",
  rhs:            "rhs",
  alternative:    "alternative",
  item:           "item",
  atom:           "item",
  group:          "group",
  repetitionWrap: "repetition-wrap",
  optionalWrap:   "optional-wrap",
  terminalRef:    "terminal-string",
  nonterminalRef: "nonterminal",
}

function chevNodeToCst(node: ChevCstNode | IToken | undefined | null, isToken = false): CstNode {
  // Guard: Chevrotain can return undefined nodes during error recovery
  if (node == null) {
    return { kind: "error", range: emptyRange(), children: [], message: "Missing node" }
  }

  if (isToken) {
    const tok = node as IToken
    const range = tokenRange(tok)
    return {
      kind: "terminal-string",
      range,
      children: [],
      token: { type: tok.tokenType.name, value: tok.image, range },
      value: tok.image,
    }
  }

  const n = node as ChevCstNode

  // Guard: n.children can itself be undefined/null on a badly recovered node
  if (!n.children) {
    return { kind: KIND_MAP[n.name] ?? "error", range: emptyRange(), children: [] }
  }

  const children: CstNode[] = []

  for (const key of Object.keys(n.children)) {
    const entries = n.children[key]
    // Guard: individual entry arrays can be undefined
    if (!entries) continue
    for (const child of entries) {
      // Guard: individual entries within the array can be null/undefined
      if (child == null) continue
      try {
        const isT = "image" in child
        children.push(chevNodeToCst(child as ChevCstNode | IToken, isT))
      } catch {
        // If a single child fails, record an error node and keep going
        children.push({ kind: "error", range: emptyRange(), children: [], message: "Failed to convert node" })
      }
    }
  }

  let range = emptyRange()
  for (let i = 0; i < children.length; i++) {
    range = i === 0 ? children[i].range : mergeRanges(range, children[i].range)
  }

  return { kind: KIND_MAP[n.name] ?? "item", range, children }
}



// ----------------------------------------------------------------------
// BUILT PARSER
// The main function that constructs a parser instance based on the active rule set, and provides a parse method.
// ----------------------------------------------------------------------
export interface BuiltParser {
  parse: (source: string) => ParseResult
  activeRuleIds: string[]
}

export function buildParser(activeRuleIds: string[]): BuiltParser {
  const builtLexer = buildLexer(activeRuleIds)
  const active = new Set(activeRuleIds)
  const parser = new GrammarCstParser(builtLexer.allTokens, builtLexer.T, active)

  function parse(source: string): ParseResult {
    const errors: ParseError[] = []

    // --- Lexer ---------------------------------------------------------------
    const lexResult = builtLexer.lexer.tokenize(source)
    for (const err of lexResult.errors) {
      errors.push({
        message: err.message,
        range: {
          startLine: err.line ?? 1,
          startColumn: err.column ?? 1,
          endLine: err.line ?? 1,
          endColumn: (err.column ?? 1) + err.length,
          startOffset: err.offset,
          endOffset: err.offset + err.length,
        },
      })
    }

    // --- Parser --------------------------------------------------------------
    parser.input = lexResult.tokens
    let chevCst: ChevCstNode | undefined
    try {
      chevCst = parser.grammar()
    } catch (e) {
      errors.push({ message: `Parser crashed: ${e}`, range: emptyRange() })
    }

    for (const err of parser.errors) {
      errors.push({
        message: err.message,
        range: err.token ? tokenRange(err.token) : emptyRange(),
      })
    }

    // --- CST to AST ----------------------------------------------------------
    // If the parser returned nothing, use an empty grammar CST so the rest 
    // of the pipeline still runs and errors are surfaced to the editor
    const cst = chevCst ? chevNodeToCst(chevCst) : emptyGrammarCst()
    const ast = cstToAst(cst, errors)

    // --- Rule Index ----------------------------------------------------------
    const ruleIndex: Record<string, AstRule> = {}
    for (const rule of ast.rules) {
      ruleIndex[rule.name] = rule
    }

    return { cst, ast, errors, ruleIndex }
  }

  return { parse, activeRuleIds }
}

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------
function tokenRange(tok: IToken): SourceRange {
  return {
    startLine: tok.startLine ?? 1,
    startColumn: tok.startColumn ?? 1,
    endLine: tok.endLine ?? 1,
    endColumn: tok.endColumn ?? 1,
    startOffset: tok.startOffset,
    endOffset: tok.endOffset ?? tok.startOffset + tok.image.length,
  }
}

function mergeRanges(a: SourceRange, b: SourceRange): SourceRange {
  return {
    startLine: Math.min(a.startLine, b.startLine),
    startColumn:
      a.startLine < b.startLine ? a.startColumn
      : a.startLine === b.startLine ? Math.min(a.startColumn, b.startColumn)
      : b.startColumn,
    endLine: Math.max(a.endLine, b.endLine),
    endColumn:
      a.endLine > b.endLine ? a.endColumn
      : a.endLine === b.endLine ? Math.max(a.endColumn, b.endColumn)
      : b.endColumn,
    startOffset: Math.min(a.startOffset, b.startOffset),
    endOffset: Math.max(a.endOffset, b.endOffset),
  }
}

function emptyRange(): SourceRange {
  return { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 }
}

function emptyGrammarCst(): CstNode {
  return { kind: "grammar", range: emptyRange(), children: [] }
}
