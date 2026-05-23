import type { AstGrammar, AstItem } from "@/grammar/types"
import type { SourceRange } from "@/grammar/types"
/*
    Tokenizer.ts

    Builds a flat list of tokens from the grammar AST for use in DSL validation.
    This is NOT the monarch tokenizer for Monaco.

    This is designed to 
    - Walk the AST and collect all terminal strings (leaves of the grammar)
    - Sort longest first so multi-char terminals match before shorter ones
    - Unrecognised characters become ERROR tokens
 */


export type DslTokenKind = "terminal" | "error"

export interface DslToken {
  kind: DslTokenKind
  value: string
  matched: string // the terminal string it matched (same as value for terminal tokens)
  range: SourceRange
}

// Collect all terminals from AST
// Returns unique terminals strings sorted longest first
export function collectTerminals(ast: AstGrammar): string[] {
  const terminals = new Set<string>()

  function walkItem(item: AstItem) {
    switch (item.kind) {
      case "terminal":
        terminals.add(item.value)
        break
      case "nonterminal":
        break
      case "group":
        item.alternatives.forEach(seq => seq.items.forEach(walkItem))
        break
      case "repeat":
      case "optional":
        walkItem(item.item)
        break
      case "exception":
        walkItem(item.item)
        walkItem(item.except)
        break
      case "error":
        break
    }
  }

  for (const rule of ast.rules) {
    for (const seq of rule.alternatives) {
      seq.items.forEach(walkItem)
    }
  }

  // Sort longest first so "!=" matches before "!"
  // Filter out empty string - it's a valid grammar production but not a tokenizable terminal
  return [...terminals].filter(t => t.length > 0).sort((a, b) => b.length - a.length)
}


// Tokenizes DSL input text against the set of terminals collected from the
// grammar AST. Returns a flat array of DslTokens.
export function tokenizeDsl(input: string, terminals: string[]): DslToken[] {
  const tokens: DslToken[] = []
  let offset = 0
  let line = 1
  let col = 1

  function makeRange(startOffset: number, startLine: number, startCol: number, value: string): SourceRange {
    const endOffset = startOffset + value.length
    // Count newlines in value to compute end line/col
    let endLine = startLine
    let endCol = startCol
    for (const ch of value) {
      if (ch === "\n") {
        endLine++
        endCol = 1
      } else {
        endCol++
      }
    }
    return { startLine, startColumn: startCol, endLine, endColumn: endCol, startOffset, endOffset }
  }

  while (offset < input.length) {
    const startOffset = offset
    const startLine = line
    const startCol = col

    // Try to match the longest terminal at current position
    let matched: string | null = null
    for (const terminal of terminals) {
      if (input.startsWith(terminal, offset)) {
        matched = terminal
        break
      }
    }

    if (matched !== null && matched.length > 0) {
      const range = makeRange(startOffset, startLine, startCol, matched)
      tokens.push({ kind: "terminal", value: matched, matched, range })
      // Advance position
      for (const ch of matched) {
        if (ch === "\n") { line++; col = 1 } else { col++ }
      }
      offset += matched.length
    } else if (matched !== null && matched.length === 0) {
      // Zero-length terminal (empty string) - skip without emitting a token
      // to avoid infinite loops. Empty string alternatives are handled by the validator.
      offset++
      col++
    } else {
      // Unrecognised character - emit error token for this single character
      const ch = input[offset]
      const range = makeRange(startOffset, startLine, startCol, ch)
      tokens.push({ kind: "error", value: ch, matched: "", range })
      if (ch === "\n") { line++; col = 1 } else { col++ }
      offset++
    }
  }

  return tokens
}