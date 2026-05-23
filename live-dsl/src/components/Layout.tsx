import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Layout({ children } : { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))] no-select">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="relative flex-1 overflow-hidden">
            <SidebarTrigger className="cursor-pointer absolute z-10"/>
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
