import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  type LucideIcon,
} from "lucide-react"

export function NavApplication({
  application,
}: {
  application: {
    name: string
    icon: LucideIcon
    isDisabled?: boolean
  }[]
}) {


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {application.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton className="cursor-pointer" disabled={item.isDisabled}>
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
