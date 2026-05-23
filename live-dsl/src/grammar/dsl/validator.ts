import type { AstGrammar, AstRule, AstSequence, AstItem } from "@/grammar/types"
import type { ParseError, SourceRange } from "@/grammar/types"
import type { DslToken } from "./tokenizer"
/*
    validator.ts

    Validates DSL input against a grammar rule suing recursive descent.
 */


// ----------------------------------------------------------------------
// TYPES & HELPER FUNCTIONS
// ----------------------------------------------------------------------
interface ParseState {
  tokens: DslToken[]
  pos: number
  grammar: AstGrammar
  ruleIndex: Record<string, AstRule>
  errors: ParseError[]
  memo: Map<string, number> // Maps ruleName@tokenPos -> furthest pos reached, for memoisation
}

interface MatchResult {
  ok: boolean
  endPos: number // how far pos advanced - new absolute position
  failPos: number
  expected: string[]
  failRule: string
}

function emptyRange(): SourceRange {
  return { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 }
}

function tokenRange(token: DslToken): SourceRange {
  return token.range
}

function ok(endPos: number): MatchResult {
  return { ok: true, endPos, failPos: -1, expected: [], failRule: "" }
}

function fail(failPos: number, expected: string[], failRule: string): MatchResult {
  return { ok: false, endPos: -1, failPos, expected, failRule }
}

function bestFail(a: MatchResult, b: MatchResult): MatchResult {
  if (!a.ok && !b.ok) return a.failPos >= b.failPos ? a : b
  return a.ok ? a : b
}


// ----------------------------------------------------------------------
// ENTRY POINT
// ----------------------------------------------------------------------
export interface ValidationResult {
  errors: ParseError[]
  valid: boolean
}

export function validateDsl(
  tokens: DslToken[],
  grammar: AstGrammar,
  entryRuleName: string,
): ValidationResult {
  const ruleIndex: Record<string, AstRule> = {}
  for (const rule of grammar.rules) ruleIndex[rule.name] = rule

  const state: ParseState = {
    tokens,
    pos: 0,
    grammar,
    ruleIndex,
    errors: [],
    memo: new Map(),
  }

  const entryRule = ruleIndex[entryRuleName]
  if (!entryRule) {
    return {
      errors: [{ message: `Entry rule "${entryRuleName}" not found in grammar`, range: emptyRange() }],
      valid: false,
    }
  }

  const result = matchRule(state, entryRule, entryRuleName, 0)

  if (!result.ok) {
    const tok = state.tokens[result.failPos]
    const expected = result.expected.length > 0
      ? result.expected.map(e => e === "" ? "end of input" : `"${e}"`).join(", ")
      : "end of input"
    const found = tok ? `"${tok.value}"` : "end of input"
    const range = tok ? tokenRange(tok) : emptyRange()
    state.errors.push({
      message: `Unexpected ${found} — expected one of: ${expected} (in rule <${result.failRule}>)`,
      range,
    })
  } else {
    state.pos = result.endPos
    if (state.pos < state.tokens.length) {
      // Filter out error tokens which are reported separately
      const remaining = state.tokens.slice(state.pos).filter(t => t.kind !== "error")
      if (remaining.length > 0) {
        const tok = remaining[0]
        state.errors.push({
          message: `Unexpected "${tok.value}" — input continues past end of rule <${entryRuleName}>`,
          range: tokenRange(tok),
        })
      }
    }
  }

  // Report unrecognised characters
  for (const tok of tokens) {
    if (tok.kind === "error") {
      state.errors.push({
        message: `Unrecognised character "${tok.value}" — not defined as a terminal in the grammar`,
        range: tokenRange(tok),
      })
    }
  }

  return { errors: state.errors, valid: state.errors.length === 0 }
}


// ----------------------------------------------------------------------
// RULE MATCHING - with left-recursive handling
//
// uses the "seed and grow" algorithm:
// 1. Try all non-left-recursive alternatives to get a "seed" match
// 2. Repeatedly try to extend the seed using left-recursive alternatives
// 3. Stop when no alternative extends the match further
//
// A "left-recursive alternative" is one whose first item is a nonterminal
// reference to the rule currently being matched.
// ----------------------------------------------------------------------
function isLeftRecursive(seq: AstSequence, ruleName: string): boolean {
  if (seq.items.length === 0) return false
  const first = seq.items[0]
  return first.kind === "nonterminal" && first.name === ruleName
}

function matchRule(
  state: ParseState,
  rule: AstRule,
  ruleName: string,
  startPos: number,
): MatchResult {
  const memoKey = `${ruleName}@${startPos}`

  // Check memo - if we've already computed the best match from this position, reuse it
  const memoPos = state.memo.get(memoKey)
  if (memoPos !== undefined) {
    return memoPos >= 0 ? ok(memoPos) : fail(startPos, [], ruleName)
  }

  const baseAlts  = rule.alternatives.filter(a => !isLeftRecursive(a, ruleName))
  const recurAlts = rule.alternatives.filter(a =>  isLeftRecursive(a, ruleName))

  // --- Phase 1: seed - try base (non-left-recursive) alternatives -------------------
  let bestResult = fail(startPos, [], ruleName)

  for (const alt of baseAlts) {
    const r = matchSequence(state, alt, ruleName, startPos)
    if (r.ok && r.endPos > (bestResult.ok ? bestResult.endPos : -1)) {
      bestResult = r
    } else if (!r.ok) {
      bestResult = bestFail(bestResult, r) as MatchResult
    }
  }

  if (!bestResult.ok) {
    state.memo.set(memoKey, -1)
    return bestResult
  }

  // --- Phase 2: grow - extend seed with left-recursive alternatives -----------------
  if (recurAlts.length > 0) {
    let seedPos = bestResult.endPos

    while (true) {
      let extended = false

      for (const alt of recurAlts) {
        // For left-recursive alts, the first item is the rule itself.
        // We substitute: pretend we already matched the rule up to seedPos,
        // then try to match the rest of the alternative from seedPos.
        const rest: AstSequence = {
          kind: "sequence",
          items: alt.items.slice(1), // skip the left-recursive first item
          range: alt.range,
        }

        const r = matchSequence(state, rest, ruleName, seedPos)
        if (r.ok && r.endPos > seedPos) {
          seedPos = r.endPos
          extended = true
          bestResult = ok(seedPos)
        }
      }

      if (!extended) break
    }
  }

  state.memo.set(memoKey, bestResult.ok ? bestResult.endPos : -1)
  return bestResult
}


// ----------------------------------------------------------------------
// SEQUENCE MATCHING
// ----------------------------------------------------------------------
function matchSequence(
  state: ParseState,
  seq: AstSequence,
  ruleName: string,
  startPos: number,
): MatchResult {
  // Empty sequence always succeeds consuming nothing
  if (seq.items.length === 0) return ok(startPos)

  let pos = startPos
  let worstFail = fail(startPos, [], ruleName)

  for (const item of seq.items) {
    const r = matchItem(state, item, ruleName, pos)
    if (!r.ok) {
      worstFail = bestFail(worstFail, r) as MatchResult
      return worstFail
    }
    pos = r.endPos
  }

  return ok(pos)
}


// ----------------------------------------------------------------------
// ITEM MATCHING
// ----------------------------------------------------------------------
function matchItem(
  state: ParseState,
  item: AstItem,
  ruleName: string,
  pos: number,
): MatchResult {
  switch (item.kind) {
    case "terminal":
      return matchTerminal(state, item.value, ruleName, pos)

    case "nonterminal": {
      const referenced = state.ruleIndex[item.name]
      if (!referenced) return ok(pos) // undefined rule - treat as empty
      return matchRule(state, referenced, item.name, pos)
    }

    case "group": {
      if (item.alternatives.length === 0) return ok(pos)
      let best = fail(pos, [], ruleName)
      for (const alt of item.alternatives) {
        const r = matchSequence(state, alt, ruleName, pos)
        if (r.ok && r.endPos > (best.ok ? best.endPos : -1)) best = r
        else if (!r.ok) best = bestFail(best, r) as MatchResult
      }
      return best
    }

    case "repeat": {
      let curPos = pos
      let count = 0

      while (true) {
        const r = matchItem(state, item.item, ruleName, curPos)
        if (!r.ok || r.endPos === curPos) break // no progress
        curPos = r.endPos
        count++
      }

      if (item.min === 1 && count === 0) {
        return matchItem(state, item.item, ruleName, pos) // will fail with proper message
      }
      return ok(curPos)
    }

    case "optional": {
      const r = matchItem(state, item.item, ruleName, pos)
      return r.ok ? r : ok(pos) // optional always succeeds
    }

    case "exception": {
      const itemResult = matchItem(state, item.item, ruleName, pos)
      if (!itemResult.ok) return itemResult

      // Check if the excepted pattern also matches
      const exceptResult = matchItem(state, item.except, ruleName, pos)
      if (exceptResult.ok && exceptResult.endPos === itemResult.endPos) {
        const exceptVal = item.except.kind === "terminal" ? item.except.value : "excepted pattern"
        return fail(pos, [`(anything except "${exceptVal}")`], ruleName)
      }
      return itemResult
    }

    case "error":
      return ok(pos)
  }
}


// ----------------------------------------------------------------------
// TERMINAL MATCHING
// ----------------------------------------------------------------------
function matchTerminal(
  state: ParseState,
  value: string,
  ruleName: string,
  pos: number,
): MatchResult {
  // Empty terminal always matches consuming nothing
  if (value === "") return ok(pos)

  // Skip error tokens silently
  let p = pos
  while (p < state.tokens.length && state.tokens[p].kind === "error") p++

  const tok = state.tokens[p]
  if (!tok) return fail(p, [value], ruleName)

  if (tok.matched === value) return ok(p + 1)

  return fail(p, [value], ruleName)
}