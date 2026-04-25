import {
  Diagram,
  Sequence,
  Choice,
  Optional,
  OneOrMore,
  ZeroOrMore,
  Terminal,
  NonTerminal,
  Skip,
} from "railroad-diagrams"
import type * as monaco from "monaco-editor"
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
  SourceRange,
} from "@/grammar/types"

export interface RenderedRule {
  name: string
  svg: string
  elements: Array<{ label: string; range: SourceRange }>
}

interface RenderContext {
  elements: Array<{ label: string; range: SourceRange }>
}

export function grammarToRailroad(grammar: AstGrammar): RenderedRule[] {
  return grammar.rules.map(rule => renderRule(rule))
}

function renderRule(rule: AstRule): RenderedRule {
  const ctx: RenderContext = { elements: [] }
  const diagramItem = alternativesToDiagram(rule.alternatives, ctx)
  const diagram = Diagram(diagramItem)
  const container = document.createElement("div")
  diagram.addTo(container)

  const RED      = "rgb(200, 50, 50)"
  const RED_FILL = "rgba(220, 50, 50, 0.15)"

  function applyRed(g: Element) {
    const rect = g.querySelector(":scope > rect")
    const text = g.querySelector(":scope > text")
    if (rect instanceof SVGElement) { rect.style.fill = RED_FILL; rect.style.stroke = RED }
    if (text instanceof SVGElement) { text.style.fill = RED }
  }

  container.querySelectorAll("g").forEach(g => {
    if (g.querySelector(":scope > text")?.textContent?.trim() !== "NOT") return
    applyRed(g)
    const siblings = Array.from(g.parentElement?.children ?? [])
    const idx = siblings.indexOf(g)
    for (let i = idx + 1; i < siblings.length; i++) {
      if (siblings[i].tagName.toLowerCase() === "g") { applyRed(siblings[i]); break }
    }
  })

  return { name: rule.name, svg: container.innerHTML, elements: ctx.elements }
}

function alternativesToDiagram(alternatives: AstSequence[], ctx: RenderContext): any {
  if (alternatives.length === 0) return Skip()
  if (alternatives.length === 1) return sequenceToDiagram(alternatives[0], ctx)
  return Choice(0, ...alternatives.map(a => sequenceToDiagram(a, ctx)))
}

function sequenceToDiagram(seq: AstSequence, ctx: RenderContext): any {
  if (seq.items.length === 0) return Skip()
  if (seq.items.length === 1) return itemToDiagram(seq.items[0], ctx)
  return Sequence(...seq.items.map(i => itemToDiagram(i, ctx)))
}

function itemToDiagram(item: AstItem, ctx: RenderContext): any {
  switch (item.kind) {
    case "terminal":    return terminalToDiagram(item, ctx)
    case "nonterminal": return nonterminalToDiagram(item, ctx)
    case "group":       return groupToDiagram(item, ctx)
    case "repeat":      return repeatToDiagram(item, ctx)
    case "optional":    return optionalToDiagram(item, ctx)
    case "exception":   return exceptionToDiagram(item, ctx)
    case "error":       return Skip()
  }
}

function terminalToDiagram(node: AstTerminal, ctx: RenderContext): any {
  const label = node.quoteStyle === "charclass" ? node.value : `${node.value}`
  ctx.elements.push({ label, range: node.range })
  return Terminal(label)
}

function nonterminalToDiagram(node: AstNonterminal, ctx: RenderContext): any {
  ctx.elements.push({ label: node.name, range: node.range })
  return NonTerminal(node.name)
}

function groupToDiagram(node: AstGroup, ctx: RenderContext): any {
  return alternativesToDiagram(node.alternatives, ctx)
}

function repeatToDiagram(node: AstRepeat, ctx: RenderContext): any {
  const inner = itemToDiagram(node.item, ctx)
  return node.min === 1 ? OneOrMore(inner) : ZeroOrMore(inner)
}

function optionalToDiagram(node: AstOptional, ctx: RenderContext): any {
  return Optional(itemToDiagram(node.item, ctx))
}

function exceptionToDiagram(node: AstException, ctx: RenderContext): any {
  if (node.item.kind === "group" && node.except.kind === "terminal") {
    const exceptVal = node.except.value
    const items = node.item.alternatives.map(seq => {
      if (
        seq.items.length === 1 &&
        seq.items[0].kind === "terminal" &&
        seq.items[0].value === exceptVal
      ) {
        return Sequence(Terminal("NOT"), sequenceToDiagram(seq, ctx))
      }
      return sequenceToDiagram(seq, ctx)
    })
    if (items.length === 0) return Skip()
    if (items.length === 1) return items[0]
    return Choice(0, ...items)
  }
  return Sequence(itemToDiagram(node.item, ctx), Terminal("NOT"), itemToDiagram(node.except, ctx))
}

export function wireRailroadInteractions(
  svgContainer: HTMLElement,
  elements: RenderedRule["elements"],
  editor: monaco.editor.IStandaloneCodeEditor,
): () => void {
  if (elements.length === 0) return () => {}

  let hoverDecorations: monaco.editor.IEditorDecorationsCollection | null = null

  function monacoRange(r: SourceRange): monaco.IRange {
    return {
      startLineNumber: r.startLine,
      startColumn:     r.startColumn,
      endLineNumber:   r.endLine,
      endColumn:       r.endColumn + 1,
    }
  }

  const textEls = Array.from(svgContainer.querySelectorAll<SVGTextElement>("text"))
  const wired: Array<{ g: HTMLElement; range: SourceRange }> = []
  let elemIdx = 0

  for (const textEl of textEls) {
    if (elemIdx >= elements.length) break
    const content = textEl.textContent?.trim() ?? ""
    const expected = elements[elemIdx]
    if (content === expected.label) {
      const g = textEl.closest("g") as HTMLElement | null
      if (g) { wired.push({ g, range: expected.range }); elemIdx++ }
    }
  }

  const handlers = wired.map(({ g, range }) => {
    const enter = () => {
      hoverDecorations?.clear()
      hoverDecorations = editor.createDecorationsCollection([{
        range: monacoRange(range),
        options: { inlineClassName: "railroad-hover-highlight" },
      }])
    }
    const leave = () => { hoverDecorations?.clear(); hoverDecorations = null }
    const click = (e: MouseEvent) => {
      e.stopPropagation()
      hoverDecorations?.clear()
      hoverDecorations = null
      editor.setSelection(monacoRange(range))
      editor.revealLineInCenter(range.startLine)
      editor.focus()
    }
    g.style.cursor = "pointer"
    g.addEventListener("mouseenter", enter)
    g.addEventListener("mouseleave", leave)
    g.addEventListener("click", click)
    return { g, enter, leave, click }
  })

  return () => {
    hoverDecorations?.clear()
    for (const { g, enter, leave, click } of handlers) {
      g.removeEventListener("mouseenter", enter)
      g.removeEventListener("mouseleave", leave)
      g.removeEventListener("click", click)
    }
  }
}