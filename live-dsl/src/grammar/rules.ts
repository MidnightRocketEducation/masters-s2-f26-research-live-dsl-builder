export type RuleCategory =
  | "terminal"
  | "nonterminal"
  | "definition"
  | "operator-alternation"
  | "operator-combine"
  | "operator-quantify"
  | "grouping"
  | "terminator"
  | "comment"
  | "other"

/* MonarchTokenizerRule describes how a rule is tokenized in the Monaco editor. It can be either:

  - "regex": a single pattern matched in the root state. 
            It has a `regex` property that defines the regular expression to match,
            a `token` property that specifies the token type for syntax highlighting,
            and a `priority` property that determines the order of matching when multiple rules could apply.
  - "state": a multi-line state-machine rule. 
            It has an `opener` property that defines the regular expression to enter the state,
            a `token` property for syntax highlighting,
            and a `state` property that specifies the name of the state to transition into.
            The body rules for this state are defined separately in ebnf-tokenizer.ts.
*/
export type MonarchTokenizerRule =
  | { kind: "regex"; regex: RegExp; token: string; priority: number }
  | { kind: "state"; opener: RegExp; token: string; state: string }

export type GrammarRule = {
  id: string
  label: string
  description: string
  /*
    A list of other rule IDs that cannot be active at the same time as this one. (handled by the store when toggling rules)
  */
  conflicts: string[]
  category: RuleCategory
  /**
    If true, at least one rule in this category must be active at all times.
    The store enforces this invariant when toggling rules - it will find a
    fallback or block the toggle rather than leave the category empty.
   */
  requiredInCategory: boolean
  // Monarch tokenizer pattern for this rule. Absent for rules with no direct syntax token (e.g. concat-implicit, terminator-newline).
  tokenizer?: MonarchTokenizerRule
}



// ----------------------------------------------------------------------
// RULES
// ----------------------------------------------------------------------
export const RULES: Record<string, GrammarRule> = {
  // --- Terminals ---------------------------------------------------------------
  // Required: at least one terminal form must be active. (handled elsewhere)
  "terminal-string-double": {
    id: "terminal-string-double",
    label: '"…" (double-quoted string)',
    description: "Literal terminal enclosed in double quotes",
    category: "terminal",
    requiredInCategory: true,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /"(?:[^"\\]|\\.)*"/, token: "bnf.terminal", priority: 10 },
  },

  "terminal-string-single": {
    id: "terminal-string-single",
    label: "'…' (single-quoted string)",
    description: "Literal terminal enclosed in single quotes",
    category: "terminal",
    requiredInCategory: true,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /'(?:[^'\\]|\\.)*'/, token: "bnf.terminal", priority: 10 },
  },

  "terminal-charclass": {
    id: "terminal-charclass",
    label: "[a–z] (character class)",
    description: "Character range notation, e.g. [a-z] or [0-9]",
    category: "terminal",
    requiredInCategory: true,
    conflicts: ["optianl-brackets"],
    tokenizer: { kind: "regex", regex: /\[[^\]]*\]/, token: "bnf.charclass", priority: 10 },
  },
  // --- Nonterminals ------------------------------------------------------------
  // Required: exactly one nonterminal form must be active. (handled elsewhere)
  "nonterminal-angled": {
    id: "nonterminal-angled",
    label: "<name> (angle brackets)",
    description: "Rule reference wrapped in angle brackets, e.g. <expr>",
    category: "nonterminal",
    requiredInCategory: true,
    conflicts: ["nonterminal-spaced"],
    tokenizer: { kind: "regex", regex: /<[A-Za-z_][A-Za-z0-9_\- ]*>/, token: "bnf.nonterminal", priority: 15 },
  },

  "nonterminal-spaced": {
    id: "nonterminal-spaced",
    label: "name (unquoted, spaced)",
    description:
      "Rule reference as a plain identifier that may contain spaces. " +
      "Activating this automatically switches concatenation to comma-separated.",
    category: "nonterminal",
    requiredInCategory: true,
    conflicts: ["nonterminal-angled", "concat-implicit"],
    tokenizer: { kind: "regex", regex: /[A-Za-z_][A-Za-z0-9_-]*/, token: "bnf.nonterminal", priority: 80 },
  },
  // --- Definitions -------------------------------------------------------------
  // Required: exactly one definition operator must be active. (handled elsewhere)
  "define-bnf": {
    id: "define-bnf",
    label: "::= (BNF)",
    description: "Classic BNF rule definition operator",
    category: "definition",
    requiredInCategory: true,
    conflicts: ["define-ebnf-iso", "define-arrow"],
    tokenizer: { kind: "regex", regex: /::=/, token: "bnf.define", priority: 20 },
  },

  "define-ebnf-iso": {
    id: "define-ebnf-iso",
    label: "= (ISO EBNF)",
    description: "ISO 14977 EBNF rule definition operator",
    category: "definition",
    requiredInCategory: true,
    conflicts: ["define-bnf", "define-arrow"],
    tokenizer: { kind: "regex", regex: /=/, token: "bnf.define", priority: 25 },
  },

  "define-arrow": {
    id: "define-arrow",
    label: "<-",
    description: "arrow definition operator",
    category: "definition",
    requiredInCategory: true,
    conflicts: ["define-bnf", "define-ebnf-iso"],
    tokenizer: { kind: "regex", regex: /<-/, token: "bnf.define", priority: 20 },
  },
  // --- Alternation -------------------------------------------------------------
  // Required: exactly one alternation operator must be active. (handled elsewhere)
  "alternation-pipe": {
    id: "alternation-pipe",
    label: "| (pipe)",
    description: "Separates alternative productions with a pipe character",
    category: "operator-alternation",
    requiredInCategory: true,
    conflicts: ["alternation-slash", "alternation-or"],
    tokenizer: { kind: "regex", regex: /\|/, token: "bnf.alternation", priority: 30 },
  },

  "alternation-slash": {
    id: "alternation-slash",
    label: "/ (slash)",
    description: "Separates alternative productions with a forward slash (PEG/ISO style)",
    category: "operator-alternation",
    requiredInCategory: true,
    conflicts: ["alternation-pipe", "alternation-or"],
    tokenizer: { kind: "regex", regex: /\//, token: "bnf.alternation", priority: 30 },
  },

  "alternation-or": {
    id: "alternation-or",
    label: "or (keyword)",
    description: "Separates alternatives using the verbose keyword 'or'",
    category: "operator-alternation",
    requiredInCategory: true,
    conflicts: ["alternation-pipe", "alternation-slash"],
    tokenizer: { kind: "regex", regex: /\bor\b/, token: "bnf.alternation", priority: 28 },
  },
  // --- Concatenation -----------------------------------------------------------
  // Required: exactly one concatenation mode must be active. (handled elsewhere)
  "concat-implicit": {
    id: "concat-implicit",
    label: "␣ (implicit, space-separated)",
    description:
    "Items in a sequence are concatenated implicitly by whitespace. " +
    "Incompatible with nonterminal-spaced.",
    category: "operator-combine",
    requiredInCategory: true,
    conflicts: ["concat-comma"],
  },

  "concat-comma": {
    id: "concat-comma",
    label: ", (explicit comma)",
    description: "Items in a sequence are separated by commas (ISO EBNF style)",
    category: "operator-combine",
    requiredInCategory: true,
    conflicts: ["concat-implicit"],
    tokenizer: { kind: "regex", regex: /,/, token: "bnf.concat", priority: 35 },
  },
  // --- Quantifiers -------------------------------------------------------------
  // NOT required - a grammar without postfix quantifiers is valid.
  // All three can coexist; none conflict with each other.
  "quantifier-star": {
    id: "quantifier-star",
    label: "* (zero or more)",
    description: "Postfix * - the preceding item may appear zero or more times",
    category: "operator-quantify",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /\*/, token: "bnf.quantifier", priority: 40 },
  },

  "quantifier-plus": {
    id: "quantifier-plus",
    label: "+ (one or more)",
    description: "Postfix + - the preceding item must appear at least once",
    category: "operator-quantify",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /\+/, token: "bnf.quantifier", priority: 40 },
  },

  "quantifier-question": {
    id: "quantifier-question",
    label: "? (optional)",
    description: "Postfix ? - the preceding item is optional",
    category: "operator-quantify",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /\?/, token: "bnf.quantifier", priority: 40 },
  },
  // --- Grouping / wrapping -----------------------------------------------------
  // NOT required - grouping constructs are optional extensions.
  "repetition-braces": {
    id: "repetition-braces",
    label: "{ } (zero or more)",
    description:
      "ISO EBNF wrap notation: { expr } means zero or more occurrences. " +
      "Semantically equivalent to expr* - normalised to AstRepeat { min:0 } in the AST.",
    category: "grouping",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /[{}]/, token: "bnf.grouping", priority: 45 },
  },

  "optional-brackets": {
    id: "optional-brackets",
    label: "[ ] (optional)",
    description:
      "ISO EBNF wrap notation: [ expr ] means the expression is optional. " +
      "Semantically equivalent to expr? - normalised to AstOptional in the AST.",
    category: "grouping",
    requiredInCategory: false,
    conflicts: ["character-class"],
    tokenizer: { kind: "regex", regex: /[\[\]]/, token: "bnf.grouping", priority: 45 },
  },

  "group-parens": {
    id: "group-parens",
    label: "( ) (grouping)",
    description: "Parentheses for sub-grouping - transparent in the AST, rendered as a sub-diagram in railroad views",
    category: "grouping",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /[()]/, token: "bnf.grouping", priority: 45 },
  },
  // --- Terminators -------------------------------------------------------------
  // Required: exactly one terminator form must be active. (handled elsewhere)
  // Newline terminator is implicit and doesn't have a tokenizer rule, but semicolon and period terminators do.
  // Newline terminator means each logical rule must fit on one line.
  // Semicolon / Period terminators allow multi-line rules.
  "terminator-newline": {
    id: "terminator-newline",
    label: "↵ (newline)",
    description: "Plain BNF: a newline terminates the rule - one rule per line",
    category: "terminator",
    requiredInCategory: true,
    conflicts: ["terminator-semicolon", "terminator-period"],
  },

  "terminator-semicolon": {
    id: "terminator-semicolon",
    label: "; (semicolon)",
    description: "Rule definition ends with a semicolon - allows multi-line rules",
    category: "terminator",
    requiredInCategory: true,
    conflicts: ["terminator-period", "terminator-newline"],
    tokenizer: { kind: "regex", regex: /;/, token: "bnf.terminator", priority: 50 },
  },

  "terminator-period": {
    id: "terminator-period",
    label: ". (period)",
    description: "ISO EBNF: rule definition ends with a period - allows multi-line rules",
    category: "terminator",
    requiredInCategory: true,
    conflicts: ["terminator-semicolon", "terminator-newline"],
    tokenizer: { kind: "regex", regex: /\./, token: "bnf.terminator", priority: 50 },
  },
  // --- Comments ----------------------------------------------------------------
  // NOT required - comments are always skipped by the lexer when active.
  "comment-line": {
    id: "comment-line",
    label: "// … (line comment)",
    description: "Single-line comment - everything after // until end of line is ignored",
    category: "comment",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /\/\/.*$/, token: "bnf.comment", priority: 5 },
  },

  "comment-block-parens": {
    id: "comment-block-parens",
    label: "(* ... *) (block comment)",
    description: "Multi-line block comment - everything between (* and *) is ignored",
    category: "comment",
    requiredInCategory: false,
    conflicts: ["comment-block"],
    tokenizer: { kind: "state", opener: /\(\*/, token: "bnf.comment", state: "parenComment" },
  },

  "comment-block": {
    id: "comment-block",
    label: "/* … */ (block comment)",
    description: "Multi-line block comment - everything between /* and */ is ignored",
    category: "comment",
    requiredInCategory: false,
    conflicts: ["comment-block-parens"],
    tokenizer: { kind: "state", opener: /\/\*/, token: "bnf.comment", state: "blockComment" },
  },

  // --- Exception ---------------------------------------------------------------
  // NOT required - exception operator is an optional extension.
  "operator-exception": {
    id: "operator-exception",
    label: "- (exception)",
    description: "ISO EBNF exception: match left side unless it also matches right side. E.g. letter - 'q'",
    category: "other",
    requiredInCategory: false,
    conflicts: [],
    tokenizer: { kind: "regex", regex: /-/, token: "bnf.exception", priority: 37 },
  },
}

// -------------------------------------------------------------------------------
// PRESETS
// A preset is a named, validated combination of rule IDs.
// Activating a preset replaces activeRuleIds entirely - conflict checking is
// skipped because presets are guaranteed to be internally consistent.
// -------------------------------------------------------------------------------
export type PresetName = "BNF" | "EBNF-ISO" | "EBNF-W3C" | "Our Choice"

export const PRESETS: Record<PresetName, string[]> = {
  // Classic Backus-Naur Form
  BNF: [
    "terminal-string-double",
    "terminal-string-single",
    "nonterminal-angled",
    "define-bnf",
    "alternation-pipe",
    "concat-implicit",
    "terminator-newline",
  ],

  // ISO 14977 Extended BNF
  "EBNF-ISO": [
    "terminal-string-double",
    "terminal-string-single",
    "nonterminal-spaced",
    "define-ebnf-iso",
    "alternation-pipe",
    "concat-comma",
    "operator-exception",
    "repetition-braces",
    "optional-brackets",
    "group-parens",
    "terminator-semicolon",
    "comment-block-parens",
  ],

  // W3C-style EBNF (used in XML, SPARQL specs)
  "EBNF-W3C": [
    "terminal-string-double",
    "terminal-string-single",
    "terminal-charclass",
    "nonterminal-spaced",
    "define-bnf",
    "alternation-pipe",
    "concat-comma",
    "quantifier-star",
    "quantifier-plus",
    "quantifier-question",
    "group-parens",
    "terminator-semicolon",
  ],

  // Our choice of rules we want to be available
    "Our Choice": [
    "terminal-string-double",
    "terminal-string-single",
    "nonterminal-angled",
    "define-ebnf-iso",
    "alternation-pipe",
    "concat-implicit",
    "repetition-braces",
    "optional-brackets",
    "quantifier-star",
    "quantifier-plus",
    "quantifier-question",
    "group-parens",
    "terminator-semicolon",
    "comment-line",
    "comment-block-parens",
  ]
}

// -------------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------------

// All categories that must always have at least one active rule
export const REQUIRED_CATEGORIES = new Set(
  Object.values(RULES)
    .filter(r => r.requiredInCategory)
    .map(r => r.category)
)

// Group all rules by category
export const RULES_BY_CATEGORY: Record<RuleCategory, GrammarRule[]> = Object.values(
  RULES
).reduce(
  (acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = []
    acc[rule.category].push(rule)
    return acc
  },
  {} as Record<RuleCategory, GrammarRule[]>
)
