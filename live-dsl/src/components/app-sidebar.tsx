import * as React from "react"

import { NavApplication } from "@/components/nav-application"
import { NavRules } from "@/components/nav-rules"
import { NavPresets } from "@/components/nav-presets"
import { NavTools } from "@/components/nav-tools"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { Link2, Library, FileCodeCorner, FileDown } from "lucide-react"



const data = {
  application: [
    {
      name: "Save & Share URL",
      icon: Link2,
      isDisabled: true,
    },
    {
      name: "Code Example List (dropdownmenu)",
      icon: Library,
      isDisabled: true,
    },
  ],
  tools: [
    {
      name: "Code Generator",
      icon: FileCodeCorner,
      isDisabled: true,
    },
    {
      name: "Export as Files",
      icon: FileDown,
      isDisabled: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavApplication application={data.application} />
        <NavPresets />
        <NavRules />
        <NavTools tools={data.tools} />
      </SidebarContent>
    </Sidebar>
  )
}
