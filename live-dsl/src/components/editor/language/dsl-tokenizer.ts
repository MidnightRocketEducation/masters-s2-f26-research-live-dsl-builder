import type * as monaco from "monaco-editor"
import type { AstGrammar } from "@/grammar/types"
import { collectTerminals } from "@/grammar/dsl/tokenizer"

export function buildDslMonarchTokenizer(
  ast: AstGrammar | null,
): monaco.languages.IMonarchLanguage {
  const terminals = ast ? collectTerminals(ast) : []

  // Sort longest first so multi-char terminals match before shorter ones
  const sorted = [...terminals].sort((a, b) => b.length - a.length)

  const terminalRules: monaco.languages.IMonarchLanguageRule[] = sorted.map(t => ({
    regex: new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    action: { token: "dsl.terminal" },
  }))

  return {
    tokenizer: {
      root: [
        ...terminalRules,
        // Anything not matched is invalid
        { regex: /\S/, action: { token: "dsl.invalid" } },
        { regex: /\s+/, action: { token: "white" } },
      ],
    },
  }
}
