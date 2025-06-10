// components/sidebar/sidebar-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isSidebarOpen: boolean; // Indicates if the sidebar is open
  toggleSidebar: () => void; // Function to toggle sidebar visibility
}

export function SidebarHeader({
  isSidebarOpen,
  toggleSidebar,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-border/50 flex-shrink-0 h-16 px-3",
        isSidebarOpen ? "justify-between" : "justify-center"
      )}
    >
      {/* Show control panel details only when the sidebar is open */}
      {isSidebarOpen && (
        <div className="flex items-center gap-3 overflow-hidden ml-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm truncate">Control Panel</h2>
            <p className="text-xs text-muted-foreground truncate">
              Manage workspace
            </p>
          </div>
        </div>
      )}

      {/* Sidebar toggle button, centered when sidebar is closed */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          !isSidebarOpen && "mx-auto"
        )}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-pressed={isSidebarOpen}
        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
