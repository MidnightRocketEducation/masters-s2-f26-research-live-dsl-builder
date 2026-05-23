import type { SourceRange } from "./source"

// A Token produced by the lexer. The parser consumes a stream of these.
export interface Token {
  type: string // The token type name from the Chevrotain lexer definition, e.g. "PIPE", "STRING_DOUBLE", "ANGLED_IDENT"
  value: string // raw text as it appears in the source
  range: SourceRange // start and end positions in the source string
}