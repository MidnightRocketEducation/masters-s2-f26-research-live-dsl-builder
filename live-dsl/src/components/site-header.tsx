import { BookMarked, Columns2, Github, GitFork, TrainTrack } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useAppStore } from "@/app/store"

export function SiteHeader() {
  const { showReferencePanel, showSecondEditorPanel, showParseTreePanel, showRailroadPanel, setReferencePanel, setSecondEditorPanel, setParseTreePanel, setRailroadPanel } = useAppStore()

  const togglelist: string[] = []

  if (showReferencePanel) togglelist.push("showReferencePanel")
  if (showSecondEditorPanel) togglelist.push("showSecondEditorPanel")
  if (showParseTreePanel) togglelist.push("showParseTreePanel")
  if (showRailroadPanel) togglelist.push("showRailroadPanel")

  return (
    <header className="sticky top-0 z-50 flex w-full  h-(--header-height) items-center border-b bg-background">
      <div className="flex w-full items-center gap-2 px-4">
        <h1 className="text-lg font-semibold">
          Live DSL Builder
          <span className="text-sm align-sub"> 101</span>
        </h1>
        <div className="ml-auto"></div>
        <ModeToggle />
        <Separator orientation="vertical" className="mx-2 h-5" />
        <ToggleGroup
        variant="outline" 
        size="sm" 
        type="multiple" 
        defaultValue={togglelist} 
        onValueChange={(values) => {
          setReferencePanel(values.includes("showReferencePanel"))
          setSecondEditorPanel(values.includes("showSecondEditorPanel"))
          setParseTreePanel(values.includes("showParseTreePanel"))
          setRailroadPanel(values.includes("showRailroadPanel"))
        }}>
          <ToggleGroupItem className="cursor-pointer" value="showReferencePanel">
            <BookMarked/>
          </ToggleGroupItem>
          <ToggleGroupItem className="cursor-pointer" value="showSecondEditorPanel">
            <Columns2/>
          </ToggleGroupItem>
          <ToggleGroupItem className="cursor-pointer" value="showParseTreePanel">
            <GitFork/>
          </ToggleGroupItem>
          <ToggleGroupItem className="cursor-pointer" value="showRailroadPanel">
            <TrainTrack/>
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="mx-2 h-5" />
        <Button
          className="h-8 w-8 cursor-pointer"
          variant="ghost"
          size="icon"
          asChild
        >
          <a href="https://github.com/MidnightRocketEducation/masters-s2-f26-research-live-dsl-builder" target="_blank" rel="noopener noreferrer">
            <Github/>
          </a>
        </Button>
      </div>
    </header>
  )
}
