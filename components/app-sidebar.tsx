"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar"
import { BarChart3, Home, Users, TrendingUp, Scale, Phone, ChevronUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar() // Get the sidebar state

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      title: "Productores",
      href: "/productores",
      icon: Users,
      isActive: pathname === "/productores",
    },
    {
      title: "Ranking",
      href: "/ranking",
      icon: TrendingUp,
      isActive: pathname === "/ranking",
    },
    {
      title: "Comparación",
      href: "/comparacion",
      icon: Scale,
      isActive: pathname === "/comparacion",
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center shrink-0">
            <div className="w-7 h-7 bg-sidebar rounded-full flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-sidebar-primary-foreground" />
            </div>
          </div>
          {/* Conditionally hide the text when sidebar is collapsed */}
          {state === "expanded" && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-lg font-bold truncate">PARANÁ</h1>
              <p className="text-xs opacity-90 truncate">DASHBOARD</p>
            </div>
          )}
        </Link>
        <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent" />
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>Contacto</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Urgencias: 0800-345-1937">
                  <Phone className="w-4 h-4" />
                  <span>Urgencias: 0800-345-1937</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Atención al cliente: 0800-345-1938">
                  <Phone className="w-4 h-4" />
                  <span>Atención al cliente: 0800-345-1938</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Grupo Paraná</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width] bg-popover text-popover-foreground"
              >
                <DropdownMenuItem>
                  <span>Línea Gratuita SRT: 0800-666-6778</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Cód. de ART: 0558</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>N° de inscripción SSN: 0972</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-between mt-2">
              {/* Conditionally hide the copyright text when sidebar is collapsed */}
              {state === "expanded" && <span className="text-xs opacity-75">Copyright © 2024</span>}
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
