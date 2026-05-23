import { createToken, Lexer, type TokenType } from "chevrotain"
/*
  lexer.ts

  Builds a Chevrotain-compatible token definition list from the set of
  currently active rule IDs. The lexer is rebuilt whenever active rules change.
  The returned token types are fed directly into the
  Chevrotain Lexer constructor in parser.ts.

  Design principle: every token is defined here. Which tokens exist in the
  lexer at any point is determined purely by the active rule set, so adding a
  new grammar rule in the future only requires adding an entry to RULE_TOKEN_MAP 
  which corresponds to a rule ID defined in rules.ts,
  and (if needed) a corresponding grammar production in parser.ts.
 */


// ----------------------------------------------------------------------
// TOKEN TYPE
// Priority determines order in the token array, which determines which patterns match first.
// The lower the number, the higher the priority.
// ----------------------------------------------------------------------
export interface TokenDef {
  token: TokenType
  priority: number
}

// ----------------------------------------------------------------------
// ALWAYS-ON TOKENS
// These are defined here but always included in the lexer regardless of active rules.
// ----------------------------------------------------------------------

// Whitespace - always skipped, never appears in the token stream
export const WS = createToken({
  name: "WS",
  pattern: /[ \t\r]+/,
  group: Lexer.SKIPPED,
})

// Newline as terminator - kept in the token stream when terminator-newline
// is active so the parser can consume it to end rule definitions.
export const NEWLINE = createToken({
  name: "NEWLINE",
  pattern: /\n/,
})

// Newline skipped - used when semicolon or period is the terminator.
// Newlines inside multi-line rule bodies are treated as whitespace.
export const NEWLINE_SKIPPED = createToken({
  name: "NEWLINE_SKIPPED",
  pattern: /\n/,
  group: Lexer.SKIPPED,
})

// ----------------------------------------------------------------------
// TOGGLEABLE TOKENS
// These are included in the lexer only when their corresponding grammar rule is active.
// The parser must be designed to handle missing tokens when rules are toggled off.
// ----------------------------------------------------------------------
const _cache: Record<string, TokenType> = {}

function tok(
  name: string,
  pattern: RegExp,
  extra: Partial<Parameters<typeof createToken>[0]> = {},
): TokenType {
  if (!_cache[name]) {
    _cache[name] = createToken({ name, pattern, ...extra })
  }
  return _cache[name]
}


// --- Terminals ----------------------------------------------------------------
const STRING_DOUBLE = tok("STRING_DOUBLE", /"[^"]*"/)
const STRING_SINGLE = tok("STRING_SINGLE", /'[^']*'/)
const CHARCLASS     = tok("CHARCLASS",     /\[[^\]]*\]/)
// --- Nonterminals -------------------------------------------------------------
const ANGLED_IDENT = tok("ANGLED_IDENT", /<[A-Za-z_][A-Za-z0-9_\- ]*>/)
const SPACED_IDENT = tok("SPACED_IDENT", /[A-Za-z_][A-Za-z0-9_-]*/)
// --- Definitions --------------------------------------------------------------
const DEFINE_BNF = tok("DEFINE_BNF", /::=/)
const DEFINE_ISO = tok("DEFINE_ISO", /=/)
const DEFINE_ARROW = tok("DEFINE_ARROW", /<-/)
// --- Alternation --------------------------------------------------------------
const PIPE  = tok("PIPE",  /\|/)
const SLASH = tok("SLASH", /\//)
const OR_KW = tok("OR_KW", /\bor\b/)
// --- Concatenation ------------------------------------------------------------
const COMMA = tok("COMMA", /,/)
// --- Exception operator -------------------------------------------------------
const EXCEPT = tok("EXCEPT", /-/)
// --- Quantifiers --------------------------------------------------------------
const STAR     = tok("STAR",     /\*/)
const PLUS     = tok("PLUS",     /\+/)
const QUESTION = tok("QUESTION", /\?/)
// --- Grouping / wrapping ------------------------------------------------------
const LPAREN   = tok("LPAREN",   /\(/)
const RPAREN   = tok("RPAREN",   /\)/)
const LBRACE   = tok("LBRACE",   /\{/)
const RBRACE   = tok("RBRACE",   /\}/)
const LBRACKET = tok("LBRACKET", /\[/)
const RBRACKET = tok("RBRACKET", /\]/)
// --- Terminators --------------------------------------------------------------
const SEMICOLON = tok("SEMICOLON", /;/)
const PERIOD    = tok("PERIOD",    /\./)
// --- Comments -----------------------------------------------------------------
const LINE_COMMENT  = tok("LINE_COMMENT",  /\/\/[^\n]*/,       { group: Lexer.SKIPPED })
const BLOCK_COMMENT        = tok("BLOCK_COMMENT",        /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//, { group: Lexer.SKIPPED })
const BLOCK_COMMENT_PARENS = tok("BLOCK_COMMENT_PARENS", /\(\*[^*]*\*+(?:[^)*][^*]*\*+)*\)/, { group: Lexer.SKIPPED })



// ----------------------------------------------------------------------
// RULE -> TOKENS MAP
// Maps grammar rule IDs to the tokens they require. Used to build the active
// token list for the lexer based on the active rules.
// ----------------------------------------------------------------------
export const RULE_TOKEN_MAP: Record<string, TokenDef[]> = {
  "terminal-string-double": [{ token: STRING_DOUBLE, priority: 10 }],
  "terminal-string-single": [{ token: STRING_SINGLE, priority: 10 }],
  "terminal-charclass":     [{ token: CHARCLASS,     priority: 10 }],

  "nonterminal-angled": [{ token: ANGLED_IDENT, priority: 40 }],
  "nonterminal-spaced": [{ token: SPACED_IDENT, priority: 40 }],

  // Longer patterns first - "::=" must beat "=" in the token array
  "define-bnf":      [{ token: DEFINE_BNF, priority: 20 }],
  "define-ebnf-iso": [{ token: DEFINE_ISO, priority: 21 }],
  "define-arrow":      [{ token: DEFINE_ARROW, priority: 20 }],

  "alternation-pipe":  [{ token: PIPE,   priority: 30 }],
  "alternation-slash": [{ token: SLASH,  priority: 30 }],
  "alternation-or":    [{ token: OR_KW,  priority: 30 }],

  "concat-comma":       [{ token: COMMA,  priority: 50 }],
  "operator-exception": [{ token: EXCEPT, priority: 51 }],
  // concat-implicit has no token - implicit from whitespace

  "quantifier-star":     [{ token: STAR,     priority: 60 }],
  "quantifier-plus":     [{ token: PLUS,     priority: 60 }],
  "quantifier-question": [{ token: QUESTION, priority: 60 }],

  "repetition-braces": [{ token: LBRACE,   priority: 65 }, { token: RBRACE,   priority: 65 }],
  "optional-brackets": [{ token: LBRACKET, priority: 65 }, { token: RBRACKET, priority: 65 }],
  "group-parens":      [{ token: LPAREN,   priority: 65 }, { token: RPAREN,   priority: 65 }],

  "terminator-semicolon": [{ token: SEMICOLON, priority: 70 }],
  "terminator-period":    [{ token: PERIOD,    priority: 70 }],
  // terminator-newline uses the always-on NEWLINE token

  "comment-line":         [{ token: LINE_COMMENT,         priority: 5 }],
  "comment-block":        [{ token: BLOCK_COMMENT,        priority: 5 }],
  "comment-block-parens": [{ token: BLOCK_COMMENT_PARENS, priority: 5 }],
}



// ----------------------------------------------------------------------
// BUILD TOKEN ACCESSOR
// Returns an object with the same keys as the token defs above, but only for
// active rules. Inactive tokens are set to null so the parser can check for
// their presence and skip branches accordingly.
// ----------------------------------------------------------------------
function buildTokenAccessor(active: Set<string>) {
  return {
    STRING_DOUBLE: active.has("terminal-string-double") ? STRING_DOUBLE : null,
    STRING_SINGLE: active.has("terminal-string-single") ? STRING_SINGLE : null,
    CHARCLASS:     active.has("terminal-charclass")     ? CHARCLASS     : null,
    ANGLED_IDENT:  active.has("nonterminal-angled")     ? ANGLED_IDENT  : null,
    SPACED_IDENT:  active.has("nonterminal-spaced")     ? SPACED_IDENT  : null,
    DEFINE_BNF:    active.has("define-bnf")             ? DEFINE_BNF    : null,
    DEFINE_ISO:    active.has("define-ebnf-iso")        ? DEFINE_ISO    : null,
    DEFINE_ARROW:  active.has("define-arrow")           ? DEFINE_ARROW  : null,
    PIPE:          active.has("alternation-pipe")        ? PIPE          : null,
    SLASH:         active.has("alternation-slash")       ? SLASH         : null,
    OR_KW:         active.has("alternation-or")          ? OR_KW         : null,
    COMMA:         active.has("concat-comma")            ? COMMA         : null,
    EXCEPT:        active.has("operator-exception")      ? EXCEPT        : null,
    STAR:          active.has("quantifier-star")         ? STAR          : null,
    PLUS:          active.has("quantifier-plus")         ? PLUS          : null,
    QUESTION:      active.has("quantifier-question")     ? QUESTION      : null,
    LBRACE:        active.has("repetition-braces")       ? LBRACE        : null,
    RBRACE:        active.has("repetition-braces")       ? RBRACE        : null,
    LBRACKET:      active.has("optional-brackets")       ? LBRACKET      : null,
    RBRACKET:      active.has("optional-brackets")       ? RBRACKET      : null,
    LPAREN:        active.has("group-parens")            ? LPAREN        : null,
    RPAREN:        active.has("group-parens")            ? RPAREN        : null,
    SEMICOLON:     active.has("terminator-semicolon")    ? SEMICOLON     : null,
    PERIOD:        active.has("terminator-period")       ? PERIOD        : null,
    NEWLINE, // always present - only meaningful when terminator-newline is active
  }
}

export type TokenAccessor = ReturnType<typeof buildTokenAccessor>



// ----------------------------------------------------------------------
// BUILD LEXER
// Builds a Chevrotain Lexer instance based on the currently active rules.
// The token list is built by collecting tokens from active rules in
// RULE_TOKEN_MAP, sorting by priority.
// The returned lexer instance is fed directly into the Chevrotain parser.
// ----------------------------------------------------------------------
export interface BuiltLexer {
  lexer: Lexer
  allTokens: TokenType[]
  T: TokenAccessor
}

export function buildLexer(activeRuleIds: string[]): BuiltLexer {
  const active = new Set(activeRuleIds)

  // Collect token defs from active rules and sort by priority
  const defs: TokenDef[] = []
  for (const id of active) {
    const entries = RULE_TOKEN_MAP[id]
    if (entries) defs.push(...entries)
  }
  defs.sort((a, b) => a.priority - b.priority)

  // Create a set with unique tokens, preserving order.
  const seen = new Set<string>()
  const uniqueTokens: TokenType[] = []
  for (const def of defs) {
    if (!seen.has(def.token.name)) {
      seen.add(def.token.name)
      uniqueTokens.push(def.token)
    }
  }

  // When terminator-newline is active, NEWLINE is a meaningful token the
  // parser consumes to end rules. Otherwise newlines are skipped like
  // whitespace so multi-line rules work with semicolon/period terminators.
  const newlineToken = active.has("terminator-newline") ? NEWLINE : NEWLINE_SKIPPED

  // WS always first; newline token chosen based on active terminator
  const allTokens: TokenType[] = [WS, newlineToken, ...uniqueTokens]

  const lexer = new Lexer(allTokens, {
    errorMessageProvider: {
      buildUnexpectedCharactersMessage(fullText, startOffset, length) {
        const snippet = fullText.slice(startOffset, startOffset + length)
        return `Unexpected character(s): "${snippet}"`
      },
      buildUnableToPopLexerModeMessage() {
        return "Unable to pop lexer mode"
      },
    },
  })

  return { lexer, allTokens, T: buildTokenAccessor(active) }
}


// ----------------------------------------------------------------------
// EXPORT TOKENS
// Export all tokens (including inactive ones as null) for use in the parser.
// The parser checks for token presence to decide which grammar branches to take.
// ----------------------------------------------------------------------
export {
  STRING_DOUBLE, STRING_SINGLE, CHARCLASS,
  ANGLED_IDENT, SPACED_IDENT,
  DEFINE_BNF, DEFINE_ISO, DEFINE_ARROW,
  PIPE, SLASH, OR_KW,
  COMMA, EXCEPT,
  STAR, PLUS, QUESTION,
  LPAREN, RPAREN, LBRACE, RBRACE, LBRACKET, RBRACKET,
  SEMICOLON, PERIOD,
  LINE_COMMENT, BLOCK_COMMENT, BLOCK_COMMENT_PARENS,
}