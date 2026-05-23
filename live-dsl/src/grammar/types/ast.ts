import type { SourceRange } from "./source"

// ----------------------------------------------------------------------
// ABSTRACT SYNTAX TREE
// Every node carries a SourceRange so diagrams and editors can link back.
// ----------------------------------------------------------------------
export interface AstBase {
  range: SourceRange
}

// --- Grammer ----------------------------------------------------------
// The root node - a complete grammar is a list of rule definitions
export interface AstGrammar extends AstBase {
  kind: "grammar"
  rules: AstRule[]
}

// --- Rule -------------------------------------------------------------
// One rule definition: name -> one or more alternatives
export interface AstRule extends AstBase {
  kind: "rule"
  name: string
  alternatives: AstSequence[] // each alternative is a sequence of items seperated by the alternation operator
}

// --- Sequence ---------------------------------------------------------
// One alternative - an ordered sequence of items
export interface AstSequence extends AstBase {
  kind: "sequence"
  items: AstItem[]
}

// --- Items ------------------------------------------------------------
export type AstItem =
  | AstTerminal
  | AstNonterminal
  | AstGroup
  | AstRepeat
  | AstOptional
  | AstException
  | AstError

// A literal terminal string
export interface AstTerminal extends AstBase {
  kind: "terminal"
  value: string // the string value with quotes stripped
  quoteStyle: "double" | "single" | "charclass"
}

/** A reference to another rule */
export interface AstNonterminal extends AstBase {
  kind: "nonterminal"
  name: string
  bracketStyle: "angled" | "spaced"
}

// Group, is preserved in the AST so it can be rendered in diagrams.
export interface AstGroup extends AstBase {
  kind: "group"
  alternatives: AstSequence[]
}

// Repetition
export interface AstRepeat extends AstBase {
  kind: "repeat"
  min: 0 | 1
  max: typeof Infinity
  item: AstItem
}

// Optional
export interface AstOptional extends AstBase {
  kind: "optional"
  item: AstItem
}

// Exception
// Left-associative: a - b - c -> Exception(Exception(a, b), c)
// Semantics: match "item" only when it does not also match "except".
export interface AstException extends AstBase {
  kind: "exception"
  item: AstItem
  except: AstItem
}

// An error node - produced when the parser recovers from a parse failure
export interface AstError extends AstBase {
  kind: "error"
  message: string
  raw: string // The raw source text that could not be parsed
}