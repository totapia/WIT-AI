import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { 
  BarChart3, 
  FileText,
  PhoneCall,
  Mail,
  BookOpen,
  Building
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useUser();

  const allNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3, permission: "dashboard" },
    { title: "Live Call", url: "/call-dashboard", icon: PhoneCall, permission: "call-dashboard" },
    { title: "Email Agent", url: "/email-agent", icon: Mail, permission: "email-agent" },
    { title: "Training", url: "/training", icon: BookOpen, permission: "training" },
    { title: "Directory", url: "/directory", icon: Building, permission: "directory" },
    { title: "Reports", url: "/reports", icon: FileText, permission: "reports" },
  ];

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter(item => hasPermission(item.permission));

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r"
      style={{
        width: isCollapsed ? '60px' : '220px'
      }}
    >
      <SidebarHeader className="h-14 p-3 border-b flex items-center">
        <div className="flex items-center justify-center w-full">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          {!isCollapsed && <span className="ml-2 font-semibold text-sm whitespace-nowrap">WIT Ai</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider>
              <div className="space-y-1 p-1.5">
                {navItems.map((item) => (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Prevent any sidebar state changes
                          const sidebarElement = e.currentTarget.closest('[data-sidebar="sidebar"]');
                          if (sidebarElement) {
                            sidebarElement.addEventListener('click', (e) => e.stopPropagation(), { once: true });
                          }
                          navigate(item.url);
                        }}
                        className={`flex items-center w-full px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs ${
                          isActive(item.url) 
                            ? "bg-primary text-primary-foreground font-medium" 
                            : "hover:bg-muted/50 text-sidebar-foreground hover:text-sidebar-accent-foreground"
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-2 text-xs">{item.title}</span>}
                      </div>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        <p className="text-xs">{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-1.5 space-y-1">
        <SidebarTrigger className="w-full h-7 text-xs" />
      </SidebarFooter>
    </Sidebar>
  );
}