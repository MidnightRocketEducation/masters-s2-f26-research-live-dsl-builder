// Source range for a token, CST node, or AST node, with offsets. 
export interface SourceRange {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
  startOffset: number
  endOffset: number
}

// For convenience, a range that points to nothing (used as a placeholder).
export const EMPTY_RANGE: SourceRange = {
  startLine: 1,
  startColumn: 1,
  endLine: 1,
  endColumn: 1,
  startOffset: 0,
  endOffset: 0,
}

export function mergeRanges(a: SourceRange, b: SourceRange): SourceRange {
  const startFirst = a.startOffset <= b.startOffset ? a : b
  const endLast = a.endOffset >= b.endOffset ? a : b
  return {
    startLine: startFirst.startLine,
    startColumn: startFirst.startColumn,
    endLine: endLast.endLine,
    endColumn: endLast.endColumn,
    startOffset: startFirst.startOffset,
    endOffset: endLast.endOffset,
  }
}