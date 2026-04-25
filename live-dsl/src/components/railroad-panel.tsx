import { useMemo, useRef, useEffect } from "react"
import { useAppStore } from "@/app/store"
import { grammarToRailroad, wireRailroadInteractions } from "@/grammar/visualization/railroad"
import type * as monaco from "monaco-editor"

export function RailroadPanel() {
  const parseResult = useAppStore(s => s.parseResult)
  const ebnfEditor  = useAppStore(s => s.ebnfEditor)

  // Keep editor in a ref so ref callbacks can always access the latest value
  // without needing to be recreated when ebnfEditor changes
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  editorRef.current = ebnfEditor

  const cleanupRefs = useRef<Map<string, () => void>>(new Map())

  const diagrams = useMemo(() => {
    if (!parseResult?.ast) return []
    try {
      return grammarToRailroad(parseResult.ast)
    } catch {
      return []
    }
  }, [parseResult?.ast])

  // Clean up all listeners on unmount
  useEffect(() => {
    return () => {
      cleanupRefs.current.forEach(cleanup => cleanup())
      cleanupRefs.current.clear()
    }
  }, [])

  // Ref callback - called by React immediately after dangerouslySetInnerHTML
  // has been applied, so the SVG is always in the DOM when this runs
  function wireContainer(el: HTMLDivElement | null, name: string, elements: ReturnType<typeof grammarToRailroad>[number]["elements"]) {
    // Always clean up previous listeners for this diagram
    const prev = cleanupRefs.current.get(name)
    if (prev) {
      prev()
      cleanupRefs.current.delete(name)
    }

    if (!el) return

    const editor = editorRef.current
    if (!editor) return

    const cleanup = wireRailroadInteractions(el, elements, editor)
    cleanupRefs.current.set(name, cleanup)
  }

  if (diagrams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {parseResult && parseResult.errors.length > 0
          ? "Fix grammar errors to see diagrams"
          : "Start writing a grammar to see railroad diagrams"}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-6">
      {diagrams.map((diagram) => (
        <div key={diagram.name} className="flex flex-col gap-2">
          <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            {diagram.name}
          </span>
          <div
            className="overflow-x-auto rounded border border-border bg-background p-2"
            dangerouslySetInnerHTML={{ __html: diagram.svg }}
            ref={el => wireContainer(el as HTMLDivElement | null, diagram.name, diagram.elements)}
          />
        </div>
      ))}
    </div>
  )
}