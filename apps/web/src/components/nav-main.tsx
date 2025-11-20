import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  pendingCount = 0,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    badge?: string
  }[]
  pendingCount?: number
}) {
  const location = useLocation()
  
  // 检查导航项是否激活
  const isNavItemActive = (itemUrl: string) => {
    // 首页精确匹配
    if (itemUrl === "/") {
      return location.pathname === "/"
    }
    // 其他路由支持前缀匹配
    return location.pathname.startsWith(itemUrl)
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isNavItemActive(item.url)
            const showBadge = item.badge === "pending" && pendingCount > 0
            
            // 在“文档管理”前添加分组分隔
            const showDivider = item.title === "文档管理"
            
            return (
              <React.Fragment key={item.title}>
                {showDivider && (
                  <div className="px-2 py-3">
                    <div className="text-xs font-medium text-muted-foreground px-2 mb-2">
                      系统管理
                    </div>
                    <div className="h-px bg-sidebar-border" />
                  </div>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={
                      showBadge 
                        ? `${item.title} (${pendingCount} 个待审批)` 
                        : item.title
                    }
                    isActive={isActive}
                  >
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {showBadge && (
                    <SidebarMenuBadge className="bg-orange-500 text-white animate-pulse">
                      {pendingCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              </React.Fragment>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}