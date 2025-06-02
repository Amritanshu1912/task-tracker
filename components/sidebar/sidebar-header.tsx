// components/sidebar/sidebar-header.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function SidebarHeader({
  isSidebarOpen,
  toggleSidebar,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-border/50 flex-shrink-0",
        isSidebarOpen
          ? "justify-between px-4 py-3 h-16"
          : "justify-center py-3 h-16"
      )}
    >
      {isSidebarOpen && (
        <div className="flex items-center gap-3 overflow-hidden">
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
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn("h-8 w-8 flex-shrink-0", isSidebarOpen ? "ml-2" : "")}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-pressed={isSidebarOpen}
        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
        ) : (
          <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
