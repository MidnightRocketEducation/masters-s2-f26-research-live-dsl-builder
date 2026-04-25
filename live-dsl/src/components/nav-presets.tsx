import { useAppStore } from "@/app/store"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { PRESETS, type PresetName } from "@/grammar/rules"
import { cn } from "@/lib/utils"

export function NavPresets() {
  const { activePreset, selectPreset } = useAppStore()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Presets</SidebarGroupLabel>
      <SidebarMenu>
          {(Object.keys(PRESETS) as PresetName[]).map((preset) => (
            <button
              key={preset}
              onClick={() => selectPreset(preset)}
              className={cn(
                "cursor-pointer w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                activePreset === preset
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {preset}
            </button>
          ))}
          {activePreset === "custom" && (
            <div className="px-3 py-2 rounded-md text-sm bg-muted text-muted-foreground italic">
              Custom
            </div>
          )}
      </SidebarMenu>
    </SidebarGroup>
  )
}