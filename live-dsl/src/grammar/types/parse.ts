import type { SourceRange } from "./source"
import type { CstNode } from "./cst"
import type { AstGrammar, AstRule } from "./ast"

// A single parse error, with a message and source range.
export interface ParseError {
  message: string
  range: SourceRange
}


// The result of parsing a grammar definition string.
// Contains the full concrete syntax tree (CST), the normalised abstract syntax tree (AST),
// and any errors encountered during parsing.
export interface ParseResult {
  cst: CstNode // The CST is a direct product of the parser, with one node per grammar rule and token.
  ast: AstGrammar // The AST is derived from the CST by collapsing syntax sugar and normalising charclasses to terminals.
  errors: ParseError[] // Includes both lexer errors (e.g. unclosed string) and parser errors (e.g. unexpected token).
  ruleIndex: Record<string, AstRule> // used to quickly find the AstRule for conflict resolution and error reporting
}