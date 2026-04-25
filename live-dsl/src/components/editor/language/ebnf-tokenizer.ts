import type * as monaco from "monaco-editor"
import { RULES } from "@/grammar/rules"

const STATE_BODIES: Record<string, monaco.languages.IMonarchLanguageRule[]> = {
  blockComment: [
    { regex: /[^/*]+/, action: { token: "bnf.comment" } },
    { regex: /\*\//,   action: { token: "bnf.comment", next: "@pop" } },
    { regex: /[/*]/,   action: { token: "bnf.comment" } },
  ],
  parenComment: [
    { regex: /[^*]+/,  action: { token: "bnf.comment" } },
    { regex: /\*\)/,   action: { token: "bnf.comment", next: "@pop" } },
    { regex: /\*/,     action: { token: "bnf.comment" } },
  ],
}

export function buildTokenizer(activeRuleIds: string[]): monaco.languages.IMonarchLanguage {
  const stateTransitions: monaco.languages.IMonarchLanguageRule[] = []
  const regexRules: { regex: RegExp; token: string; priority: number }[] = []
  const usedStates = new Set<string>()

  for (const id of activeRuleIds) {
    const t = RULES[id]?.tokenizer
    if (!t) continue
    if (t.kind === "state") {
      stateTransitions.push({ regex: t.opener, action: { token: t.token, next: `@${t.state}` } })
      usedStates.add(t.state)
    } else {
      regexRules.push(t)
    }
  }

  regexRules.sort((a, b) => a.priority - b.priority)

  const states: Record<string, monaco.languages.IMonarchLanguageRule[]> = {
    root: [
      ...stateTransitions,
      ...regexRules.map(r => ({ regex: r.regex, action: { token: r.token } })),
      { regex: /[A-Za-z_][A-Za-z0-9_]*/, action: { token: "identifier" } },
      { regex: /\s+/,                     action: { token: "white" } },
    ],
  }

  for (const state of usedStates) {
    states[state] = STATE_BODIES[state]
  }

  return { tokenizer: states }
}
