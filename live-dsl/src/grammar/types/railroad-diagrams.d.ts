declare module "railroad-diagrams" {
  interface DiagramItem {
    addTo(container: HTMLElement): void
  }

  function Diagram(...items: DiagramItem[]): DiagramItem
  function Sequence(...items: DiagramItem[]): DiagramItem
  function Choice(defaultIndex: number, ...items: DiagramItem[]): DiagramItem
  function Optional(item: DiagramItem, skip?: "skip"): DiagramItem
  function OneOrMore(item: DiagramItem, repeat?: DiagramItem): DiagramItem
  function ZeroOrMore(item: DiagramItem, repeat?: DiagramItem): DiagramItem
  function Terminal(text: string, href?: string, title?: string): DiagramItem
  function NonTerminal(text: string, href?: string, title?: string): DiagramItem
  function Comment(text: string, href?: string, title?: string): DiagramItem
  function Skip(): DiagramItem
  function Start(type?: "simple" | "complex"): DiagramItem
  function End(type?: "simple" | "complex"): DiagramItem
}