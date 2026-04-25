import type {
  AstGrammar,
  AstRule,
  AstSequence,
  AstItem,
  AstTerminal,
  AstNonterminal,
  AstGroup,
  AstRepeat,
  AstOptional,
  AstException,
  AstError,
  CstNode,
  ParseError,
  SourceRange,
} from "@/grammar/types"
/*
  ast.ts

  Transforms our CstNode tree into a AstGrammar.
 */


/**
 * Expands a charclass inner string (brackets already stripped) into individual
 * character strings. Handles ranges (a-z, 0-9) and literal chars mixed together.
 * Returns null for negated classes ([^...]) or any invalid range so the caller
 * can fall back to an opaque terminal and surface an error.
 */
function expandCharclass(inner: string): string[] | null {
  if (inner.startsWith("^")) return null
 
  // Must contain at least one range operator - bare [a] or [abc] are not valid
  if (!inner.includes("-")) return null
 
  // Every "-" must be flanked by valid single characters: [-], [1-], [-z] are all invalid
  for (let j = 0; j < inner.length; j++) {
    if (inner[j] === "-") {
      if (j === 0 || j === inner.length - 1) return null  // leading or trailing dash
      if (inner[j - 1] === "-" || inner[j + 1] === "-") return null  // adjacent dashes
    }
  }

  const chars: string[] = []
  let i = 0

  while (i < inner.length) {
    const ch = inner[i]

    if (i + 2 < inner.length && inner[i + 1] === "-") {
      const toChar = inner[i + 2]
      const charAfterTo = inner[i + 3] ?? ""

      if (/[a-zA-Z0-9]/.test(charAfterTo)) return null

      const from = ch.codePointAt(0)!
      const to   = toChar.codePointAt(0)!

      const bothDigits  = /[0-9]/.test(ch) && /[0-9]/.test(toChar)
      const bothLower   = /[a-z]/.test(ch) && /[a-z]/.test(toChar)
      const bothUpper   = /[A-Z]/.test(ch) && /[A-Z]/.test(toChar)
      const sameClass   = bothDigits || bothLower || bothUpper

      if (!sameClass) return null
      if (from > to)  return null

      for (let code = from; code <= to; code++) {
        chars.push(String.fromCodePoint(code))
      }
      i += 3
      continue
    }

    if (!/[ -~]/.test(ch)) return null

    chars.push(ch)
    i++
  }

  return chars.length > 0 ? chars : null
}


// ----------------------------------------------------------------------
// ENTRY POINT
// ----------------------------------------------------------------------
export function cstToAst(cst: CstNode, errors: ParseError[]): AstGrammar {
  const rules: AstRule[] = []

  if (cst.kind !== "grammar") {
    errors.push({ message: "CST root is not a grammar node", range: cst.range })
    return { kind: "grammar", rules, range: cst.range }
  }

  for (const child of cst.children) {
    if (child.kind === "rule-definition") {
      const rule = transformRule(child, errors)
      if (rule) rules.push(rule)
    }
  }

  return { kind: "grammar", rules, range: cst.range }
}


// ----------------------------------------------------------------------
// RULE DEFINITION
// ----------------------------------------------------------------------
function transformRule(node: CstNode, errors: ParseError[]): AstRule | null {
  const lhsNode = firstChild(node, "lhs")
  const rhsNode = firstChild(node, "rhs")

  if (!lhsNode) {
    errors.push({ message: "Rule definition missing LHS", range: node.range })
    return null
  }

  const name = extractNonterminalName(lhsNode)
  if (!name) {
    errors.push({ message: "Could not extract rule name from LHS", range: lhsNode.range })
    return null
  }

  const alternatives: AstSequence[] = rhsNode ? transformRhs(rhsNode, errors) : []
  return { kind: "rule", name, alternatives, range: node.range }
}


// ----------------------------------------------------------------------
// RHS -> alternatives
// ----------------------------------------------------------------------
function transformRhs(node: CstNode, errors: ParseError[]): AstSequence[] {
  const altNodes = childrenOf(node, "alternative")
  return altNodes.map(a => transformAlternative(a, errors))
}

// ----------------------------------------------------------------------
// ALTERNATIVE -> sequence of items
// ----------------------------------------------------------------------
function transformAlternative(node: CstNode, errors: ParseError[]): AstSequence {
  const itemNodes = childrenOf(node, "item")
  const items: AstItem[] = itemNodes.map(i => transformItem(i, errors))
  return { kind: "sequence", items, range: node.range }
}


// ----------------------------------------------------------------------
// ITEM -> ATOM + optional quantifier + optional exception
// ----------------------------------------------------------------------
function transformItem(node: CstNode, errors: ParseError[]): AstItem {
  const quantTok = node.children.find(c =>
    c.token && ["STAR", "PLUS", "QUESTION"].includes(c.token.type)
  )

  /*
    Chevrotain groups children by subrule name, not by source order.
    For item, the children are:
    - atom nodes (from SUBRULE and SUBRULE2 calls - first is the base, rest are except targets)
    - EXCEPT tokens (one per exception clause)
    - quantifier token (STAR/PLUS/QUESTION) if present

    All atom-like children is collected in order, first is base, rest are except targets.
   */
  const atomChildren = node.children.filter(c =>
    !c.token || !["STAR", "PLUS", "QUESTION", "EXCEPT"].includes(c.token.type)
  )
  const exceptCount = node.children.filter(c => c.token?.type === "EXCEPT").length

  // First atom child is the base
  const baseNode = atomChildren[0]
  let base: AstItem = baseNode
    ? transformAtom(baseNode, errors)
    : errorNode("Missing atom in item", "", node.range)

  // Apply quantifier (tighter binding than exception)
  if (quantTok) {
    switch (quantTok.token!.type) {
      case "STAR":
        base = { kind: "repeat", min: 0, max: Infinity, item: base, range: node.range } as AstRepeat
        break
      case "PLUS":
        base = { kind: "repeat", min: 1, max: Infinity, item: base, range: node.range } as AstRepeat
        break
      case "QUESTION":
        base = { kind: "optional", item: base, range: node.range } as AstOptional
        break
    }
  }

  // Build left-associative chain of AstException nodes from remaining atom children
  // Each pairs with one EXCEPT token - remaining atomChildren[1..n] are except targets
  let result: AstItem = base
  for (let i = 0; i < exceptCount; i++) {
    const exceptNode = atomChildren[i + 1]
    if (!exceptNode) break
    const exceptItem = transformAtom(exceptNode, errors)
    result = {
      kind: "exception",
      item: result,
      except: exceptItem,
      range: node.range,
    } as AstException
  }

  return result
}


// ----------------------------------------------------------------------
// ATOM
// ----------------------------------------------------------------------
function transformAtom(node: CstNode, errors: ParseError[]): AstItem {
  for (const child of node.children) {
    switch (child.kind) {
      case "group":           return transformGroup(child, errors)
      case "repetition-wrap": return transformRepetitionWrap(child, errors)
      case "optional-wrap":   return transformOptionalWrap(child, errors)
      case "terminal-string": return transformTerminal(child, errors)
      case "nonterminal":     return transformNonterminal(child, errors)
      case "error":           return errorNode(child.message ?? "Parse error", child.value ?? "", child.range)
    }
    if (child.children.length > 0) return transformAtom(child, errors)
  }

  if (node.token) return transformLeafToken(node, errors)

  return errorNode("Could not resolve atom", "", node.range)
}


// ----------------------------------------------------------------------
// LEAF TOKEN
// ----------------------------------------------------------------------

/*
  Unescapes common escape sequences in terminal string values.
  The lexer captures raw source text including backslash sequences,
  we convert them to their actual characters here so the generator
  and validator work with real values (e.g. actual newline for \n).
*/
function unescapeString(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")   // \n -> newline
    .replace(/\\t/g, "\t")   // \t -> tab
    .replace(/\\r/g, "\r")   // \r -> carriage return
    .replace(/\\0/g, "\0")   // \0 -> null
    .replace(/\\\\/g, "\\")  // \\ -> backslash
    .replace(/\\"/g, "\"")   // \" -> double quote
    .replace(/\\'/g, "\'")   // \' -> single quote
}

function transformLeafToken(node: CstNode, errors: ParseError[]): AstItem {
  const tok = node.token!

  switch (tok.type) {
    case "STRING_DOUBLE":
      return {
        kind: "terminal",
        value: unescapeString(tok.value.slice(1, -1)),
        quoteStyle: "double",
        range: node.range,
      } as AstTerminal

    case "STRING_SINGLE":
      return {
        kind: "terminal",
        value: unescapeString(tok.value.slice(1, -1)),
        quoteStyle: "single",
        range: node.range,
      } as AstTerminal

    case "CHARCLASS": {
      const inner = tok.value.slice(1, -1) // strip [ ]
      const isNegated = inner.startsWith("^")
      const expanded = expandCharclass(inner)

      if (!expanded) {
        if (!isNegated) {
          // Invalid range (backwards, mixed classes, etc.) - push to errors array
          // so Monaco shows a red squiggle, and return an error node
          const msg = `Invalid character class "${tok.value}" - check range direction and that both ends are the same type (digit, lowercase, uppercase)`
          errors.push({ message: msg, range: node.range })
          return errorNode(msg, tok.value, node.range)
        }
        // Negated class - can't expand, keep as opaque terminal
        return {
          kind: "terminal",
          value: tok.value,
          quoteStyle: "charclass",
          range: node.range,
        } as AstTerminal
      }

      // Single character - just a terminal
      if (expanded.length === 1) {
        return {
          kind: "terminal",
          value: expanded[0],
          quoteStyle: "double",
          range: node.range,
        } as AstTerminal
      }

      // Multiple characters - expand into a group of single-char alternatives
      return {
        kind: "group",
        alternatives: expanded.map(ch => ({
          kind: "sequence" as const,
          items: [{
            kind: "terminal" as const,
            value: ch,
            quoteStyle: "double" as const,
            range: node.range,
          } as AstTerminal],
          range: node.range,
        })),
        range: node.range,
      } as AstGroup
    }

    case "ANGLED_IDENT":
      return {
        kind: "nonterminal",
        name: tok.value.slice(1, -1).trim(),
        bracketStyle: "angled",
        range: node.range,
      } as AstNonterminal

    case "SPACED_IDENT":
      return {
        kind: "nonterminal",
        name: tok.value.trim(),
        bracketStyle: "spaced",
        range: node.range,
      } as AstNonterminal

    default:
      return errorNode(`Unexpected token type "${tok.type}"`, tok.value, node.range)
  }
}

// ----------------------------------------------------------------------
// TERMINALS / NONTERMINALS
// ----------------------------------------------------------------------
function transformTerminal(node: CstNode, errors: ParseError[]): AstItem {
  const leaf = node.children.find(c => c.token !== undefined)
  if (leaf) return transformLeafToken(leaf, errors)
  if (node.token) return transformLeafToken(node, errors)
  return errorNode("Empty terminal node", "", node.range)
}

function transformNonterminal(node: CstNode, errors: ParseError[]): AstItem {
  const leaf = node.children.find(c => c.token !== undefined)
  if (leaf) return transformLeafToken(leaf, errors)
  if (node.token) return transformLeafToken(node, errors)
  return errorNode("Empty nonterminal node", "", node.range)
}

function extractNonterminalName(lhsNode: CstNode): string | null {
  function walk(n: CstNode): string | null {
    if (n.token) {
      if (n.token.type === "ANGLED_IDENT") return n.token.value.slice(1, -1).trim()
      if (n.token.type === "SPACED_IDENT") return n.token.value.trim()
    }
    for (const c of n.children) {
      const result = walk(c)
      if (result) return result
    }
    return null
  }
  return walk(lhsNode)
}


// ----------------------------------------------------------------------
// GROUP / REPETITION WRAP / OPTIONAL WRAP
// ----------------------------------------------------------------------
function transformGroup(node: CstNode, errors: ParseError[]): AstGroup {
  const rhsNode = firstChild(node, "rhs")
  const alternatives = rhsNode ? transformRhs(rhsNode, errors) : []
  return { kind: "group", alternatives, range: node.range }
}

function transformRepetitionWrap(node: CstNode, errors: ParseError[]): AstRepeat {
  const rhsNode = firstChild(node, "rhs")
  const alternatives = rhsNode ? transformRhs(rhsNode, errors) : []
  const item: AstItem =
    alternatives.length === 1 && alternatives[0].items.length === 1
      ? alternatives[0].items[0]
      : ({ kind: "group", alternatives, range: node.range } as AstGroup)
  return { kind: "repeat", min: 0, max: Infinity, item, range: node.range }
}

function transformOptionalWrap(node: CstNode, errors: ParseError[]): AstOptional {
  const rhsNode = firstChild(node, "rhs")
  const alternatives = rhsNode ? transformRhs(rhsNode, errors) : []
  const item: AstItem =
    alternatives.length === 1 && alternatives[0].items.length === 1
      ? alternatives[0].items[0]
      : ({ kind: "group", alternatives, range: node.range } as AstGroup)
  return { kind: "optional", item, range: node.range }
}



// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------
function errorNode(message: string, raw: string, range: SourceRange): AstError {
  return { kind: "error", message, raw, range }
}

function childrenOf(node: CstNode, kind: CstNode["kind"]): CstNode[] {
  return node.children.filter(c => c.kind === kind)
}

function firstChild(node: CstNode, kind: CstNode["kind"]): CstNode | undefined {
  return node.children.find(c => c.kind === kind)
}
