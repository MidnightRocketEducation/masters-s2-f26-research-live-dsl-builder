import type { AstGrammar, AstRule, AstSequence, AstItem, AstTerminal } from "@/grammar/types"
/*
    generator.ts

    Generates a random valid string from a grammar rule.

    Algorithm:
    - Start from the selected rule
    - at each choice node, pick a random alternative
    - at each repeat node, pick a random count with a max of MAX_REPEAT
    - at each optional node, 50% chance to include
    - at each terminal, emit the value directly
    - at each nontermianl reference, recurse into that rule
    - at max depth, always pick the shortest/non-recursive alternative
 */


const MAX_DEPTH = 8
const MAX_REPEAT = 3

// Entry point, the selected rule
export function generateFromRule(
  grammar: AstGrammar,
  ruleName: string,
): string | null {
  const ruleIndex: Record<string, AstRule> = {}
  for (const rule of grammar.rules) {
    ruleIndex[rule.name] = rule
  }

  const rule = ruleIndex[ruleName]
  if (!rule) return null

  try {
    return generateRule(rule, ruleIndex, 0)
  } catch {
    return null
  }
}


// Estimates the "weight" of an alternative - used to prefer shorter/simpler
// alternatives at max depth. Lower is better
function estimateWeight(seq: AstSequence, currentRuleName: string): number {
  let weight = 0
  function walkItem(item: AstItem) {
    switch (item.kind) {
      case "terminal": break
      case "nonterminal":
        weight += item.name === currentRuleName ? 100 : 1
        break
      case "group":
        item.alternatives.forEach(a => a.items.forEach(walkItem))
        break
      case "repeat":
      case "optional":
        walkItem(item.item)
        break
      case "exception":
        walkItem(item.item)
        break
      case "error": break
    }
  }
  seq.items.forEach(walkItem)
  return weight
}


// --- Generators --------------------------------------------------------------
function generateRule(
  rule: AstRule,
  ruleIndex: Record<string, AstRule>,
  depth: number,
): string {
  if (rule.alternatives.length === 0) return ""

  let alternatives = rule.alternatives

  if (depth >= MAX_DEPTH) {
    // At max depth: sort by weight and pick the lightest
    alternatives = [...alternatives].sort(
      (a, b) => estimateWeight(a, rule.name) - estimateWeight(b, rule.name),
    )
    // Pick randomly among the top third (lightest)
    const topCount = Math.max(1, Math.ceil(alternatives.length / 3))
    alternatives = alternatives.slice(0, topCount)
  }

  const chosen = pickRandom(alternatives)
  return generateSequence(chosen, rule.name, ruleIndex, depth)
}

function generateSequence(
  seq: AstSequence,
  currentRuleName: string,
  ruleIndex: Record<string, AstRule>,
  depth: number,
): string {
  return seq.items.map(item => generateItem(item, currentRuleName, ruleIndex, depth)).join("")
}

function generateItem(
  item: AstItem,
  currentRuleName: string,
  ruleIndex: Record<string, AstRule>,
  depth: number,
): string {
  switch (item.kind) {
    case "terminal":
      return item.value

    case "nonterminal": {
      const rule = ruleIndex[item.name]
      if (!rule) return ""
      return generateRule(rule, ruleIndex, depth + 1)
    }

    case "group": {
      if (item.alternatives.length === 0) return ""
      const chosen = depth >= MAX_DEPTH
        ? [...item.alternatives].sort(
            (a, b) => estimateWeight(a, currentRuleName) - estimateWeight(b, currentRuleName)
          )[0]
        : pickRandom(item.alternatives)
      return generateSequence(chosen, currentRuleName, ruleIndex, depth)
    }

    case "repeat": {
      const min = item.min
      const max = depth >= MAX_DEPTH ? min : min + rand(MAX_REPEAT - min + 1)
      let result = ""
      for (let i = 0; i < max; i++) {
        result += generateItem(item.item, currentRuleName, ruleIndex, depth + 1)
      }
      return result
    }

    case "optional": {
      // At max depth always skip optional to keep output short
      if (depth >= MAX_DEPTH) return ""
      return Math.random() < 0.5
        ? generateItem(item.item, currentRuleName, ruleIndex, depth + 1)
        : ""
    }

    case "exception": {
      // Terminal - terminal: if both values are the same, nothing can be generated
      if (item.item.kind === "terminal" && item.except.kind === "terminal") {
        if (item.item.value === item.except.value) return ""
        // Different values - main item is still valid
        return item.item.value
      }
 
      // Group - terminal: filter out the excepted value from alternatives
      if (item.item.kind === "group" && item.except.kind === "terminal") {
        const exceptVal = (item.except as AstTerminal).value
        const filtered = item.item.alternatives.filter(seq => {
          if (seq.items.length !== 1) return true
          const first = seq.items[0]
          return !(first.kind === "terminal" && first.value === exceptVal)
        })
        if (filtered.length === 0) return ""
        const chosen = pickRandom(filtered)
        return generateSequence(chosen, currentRuleName, ruleIndex, depth)
      }
 
      return generateItem(item.item, currentRuleName, ruleIndex, depth)
    }

    case "error":
      return ""
  }
}



// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------
function rand(max: number): number {
  return Math.floor(Math.random() * max)
}

function pickRandom<T>(arr: T[]): T {
  return arr[rand(arr.length)]
}