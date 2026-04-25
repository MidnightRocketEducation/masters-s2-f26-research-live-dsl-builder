import { useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import { useAppStore, type CodeRange } from "@/app/store"
import { buildTokenizer } from "@/components/editor/language/ebnf-tokenizer"
import { registerThemes } from "@/components/editor/language/theme"
import { useTheme } from "@/components/theme-provider"

export function EBNFEditor() {
  const { bnfCode, setBNFCode, parseResult, activeRuleIds, registerEditor } = useAppStore()
  const { isDark } = useTheme()
  const ebnfTheme = isDark ? "editor-dark" : "editor-light"

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)

  // Switch theme when app theme changes
  useEffect(() => {
    monacoRef.current?.editor.setTheme(ebnfTheme)
  }, [ebnfTheme])

  // Update tokenizer and re-parse when activeRuleIds changes
  useEffect(() => {
    monacoRef.current?.languages.setMonarchTokensProvider("ebnf", buildTokenizer(activeRuleIds))
    monacoRef.current?.editor.setModelLanguage(editorRef.current?.getModel()!, "ebnf")
  }, [activeRuleIds])

  // register language and theme
  function handleBeforeMount(m: typeof monaco) {
    // theme
    registerThemes(m)
    // language
    m.languages.register({ id: "ebnf" })
  }

  // set up editor instance, theme, language, and highlight & selection callbacks on mount
  function handleMount(editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) {
    editorRef.current = editor
    monacoRef.current = m
    registerEditor(editor)
    m.editor.setTheme(ebnfTheme)
    m.editor.setModelLanguage(editor.getModel()!, "ebnf")
    m.languages.setMonarchTokensProvider("ebnf", buildTokenizer(activeRuleIds))

    // Set up callbacks for highlighting and selecting code from railroad interactions
    let hoverDecorations: monaco.editor.IEditorDecorationsCollection | null = null

    const highlightCallback = (range: CodeRange) => {
      hoverDecorations?.clear()
      hoverDecorations = editor.createDecorationsCollection([{
        range: new m.Range(range.startLine, range.startColumn, range.endLine, range.endColumn),
        options: {
          className: "railroad-hover-highlight",
          inlineClassName: "railroad-hover-highlight-inline",
        },
      }])
    }

    const selectCallback = (range: CodeRange) => {
      hoverDecorations?.clear()
      hoverDecorations = null
      editor.setSelection(new m.Selection(range.startLine, range.startColumn, range.endLine, range.endColumn))
      editor.revealRangeInCenter(new m.Range(range.startLine, range.startColumn, range.endLine, range.endColumn))
      editor.focus()
    }

    useAppStore.setState({ highlightCallback, selectCallback })
  }

  // set markers for parse errors
  useEffect(() => {
    const m = monacoRef.current
    const editor = editorRef.current
    if (!m || !editor) return
    const model = editor.getModel()
    if (!model) return

    m.editor.setModelMarkers(
      model,
      "ebnf-parser",
      (parseResult?.errors ?? []).map(err => ({
        severity: m.MarkerSeverity.Error,
        message: err.message,
        startLineNumber: err.range.startLine,
        startColumn: err.range.startColumn,
        endLineNumber: err.range.endLine,
        endColumn: Math.max(err.range.endColumn, err.range.startColumn + 1),
      }))
    )
  }, [parseResult])

  return (
    <Editor
      value={bnfCode}
      onChange={(value) => { if (value !== undefined) setBNFCode(value) }}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
    />
  )
}