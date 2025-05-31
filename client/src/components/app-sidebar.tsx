import * as React from "react";
import { BotMessageSquare, HomeIcon, LayoutDashboardIcon, Plus,  } from "lucide-react";


import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { profile } from "@/http";
import { Link } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: myData } = useQuery({
    queryKey: ["me"],
    queryFn: profile,
  });
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border mb-4">
        {myData && <NavUser user={myData?.user} />}
      </SidebarHeader>
      <SidebarContent>
        <Link to="/">
          <SidebarMenuButton >
            <HomeIcon />
            <span>Home</span>
          </SidebarMenuButton  >
        </Link>

        <SidebarSeparator className="mx-0" />
        <Link to="/dashboard">
          <SidebarMenuButton >
            <LayoutDashboardIcon />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>

        <SidebarSeparator className="mx-0" />
        <Link to="/xpenza-ai">
          <SidebarMenuButton >
            <BotMessageSquare /> 
            <span>Xpenza AI</span>
          </SidebarMenuButton>
        </Link>


        <SidebarSeparator className="mx-0" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
