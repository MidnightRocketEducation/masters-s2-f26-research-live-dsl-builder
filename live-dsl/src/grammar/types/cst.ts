import type { SourceRange } from "./source"
import type { Token } from "./token"


// ----------------------------------------------------------------------
// CONCRETE SYNTAX TREE
// Preserves every token from the source so Monaco can map positions exactly.
// ----------------------------------------------------------------------
export type CstNodeKind =
  | "grammar"
  | "rule-definition"
  | "lhs"
  | "rhs"
  | "alternative"
  | "sequence"
  | "item"
  | "group"
  | "quantified"
  | "repetition-wrap"
  | "optional-wrap"
  | "terminal-string"
  | "terminal-charclass"
  | "nonterminal"
  | "error"

export interface CstNode {
  kind: CstNodeKind
  range: SourceRange
  children: CstNode[]
  token?: Token // present on leaf nodes - the raw lexer token
  message?: string // error message for recovered error nodes
  value?: string // raw matched text for terminal/nonterminal leaves
}