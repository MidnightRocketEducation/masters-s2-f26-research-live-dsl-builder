import type * as monaco from "monaco-editor"
// Monaco themes are global and all editors share them,
// Meaning we can't have separate themes for EBNF and DSL editors,
// So we define themes for both EBNF and DSL as one for light and one for dark,
// and switch between them based on the active app theme.

export function registerThemes(m: typeof monaco): void {
  m.editor.defineTheme("editor-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "identifier",      foreground: "D4D4D4" },
      { token: "white",           foreground: "D4D4D4" },

      { token: "bnf.define",      foreground: "569CD6" },
      { token: "bnf.terminator",  foreground: "569CD6" },
      { token: "bnf.nonterminal", foreground: "9CDCFE" },
      { token: "bnf.terminal",    foreground: "CE9178" },
      { token: "bnf.charclass",   foreground: "D7BA7D" },
      { token: "bnf.alternation", foreground: "C586C0" },
      { token: "bnf.concat",      foreground: "D4D4D4" },
      { token: "bnf.exception",   foreground: "CE6050" },
      { token: "bnf.quantifier",  foreground: "C586C0" },
      { token: "bnf.grouping",    foreground: "FFD700" },
      { token: "bnf.comment",     foreground: "6A9955" },

      { token: "dsl.terminal", foreground: "569CD6" },
      { token: "dsl.invalid",  foreground: "F44747" },
    ],
    colors: { "editor.background": "#1e1e1e" },
  })

  m.editor.defineTheme("editor-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "identifier",      foreground: "000000" },
      { token: "white",           foreground: "000000" },

      { token: "bnf.define",      foreground: "0000FF" },
      { token: "bnf.terminator",  foreground: "0000FF" },
      { token: "bnf.nonterminal", foreground: "001080" },
      { token: "bnf.terminal",    foreground: "A31515" },
      { token: "bnf.charclass",   foreground: "811F3F" },
      { token: "bnf.alternation", foreground: "800080" },
      { token: "bnf.concat",      foreground: "000000" },
      { token: "bnf.exception",   foreground: "C0392B" },
      { token: "bnf.quantifier",  foreground: "800080" },
      { token: "bnf.grouping",    foreground: "AF7109" },
      { token: "bnf.comment",     foreground: "008000" },

      { token: "dsl.terminal", foreground: "0000FF" },
      { token: "dsl.invalid",  foreground: "CD3131" },
    ],
    colors: { "editor.background": "#ffffff" },
  })
}