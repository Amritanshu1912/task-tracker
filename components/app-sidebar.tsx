// --- START OF FILE components/app-sidebar.tsx ---
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // Used by SidebarButton
import { Badge } from "@/components/ui/badge"; // Used by SidebarButton
import { useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskEditDialog } from "@/components/task-edit-dialog";

// Import new sub-components
import { SidebarHeader } from "./sidebar/sidebar-header";
import { SidebarStats } from "./sidebar/sidebar-stats";
import { SidebarMainContent } from "./sidebar/sidebar-main-content";

// SidebarButton remains here as its display (label/tooltip) depends on isSidebarOpen
export const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  className,
  badge,
  tooltip,
  isSidebarOpen, // Explicitly pass isSidebarOpen
  ...props
}: {
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: "ghost" | "outline" | "default" | "secondary" | "destructive";
  className?: string;
  badge?: string | number;
  tooltip?: string;
  isSidebarOpen: boolean; // Required prop
  [key: string]: any;
}) => {
  const buttonContent = (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        isSidebarOpen
          ? "w-full justify-start gap-3 h-9 px-3 font-normal"
          : "w-10 h-10 p-0 mx-auto flex items-center justify-center", // Centered icon when collapsed
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn("shrink-0", isSidebarOpen ? "w-4 h-4" : "w-5 h-5")}
        />
      )}
      {isSidebarOpen && <span className="truncate">{label}</span>}
      {isSidebarOpen && badge && (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Button>
  );

  if (!isSidebarOpen && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return buttonContent;
};

export function AppSidebar() {
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);
  const stats = useTaskStore((state) => state.stats);

  // State for "Add Root Task" dialog, still managed here as TaskEditDialog is global
  // const [isAddRootTaskDialogOpen, setIsAddRootTaskDialogOpen] = useState(false);
  const isAddRootTaskDialogOpen = useTaskStore(
    (state) => state.isAddRootTaskDialogOpen
  );
  // We need an action to close it, typically onOpenChange for the Dialog component
  // Let's use closeAddRootTaskDialog directly or pass a function that calls it.
  const closeAddRootTaskDialog = useTaskStore(
    (state) => state.closeAddRootTaskDialog
  );

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 z-30",
        "flex flex-col print:hidden",
        "h-[calc(100vh-4rem)]",
        "bg-card border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-72" : "w-16" // Controls overall width
      )}
      aria-label="Control Panel Sidebar"
    >
      <SidebarHeader
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <SidebarStats stats={stats} isSidebarOpen={isSidebarOpen} />

      <SidebarMainContent
        isSidebarOpen={isSidebarOpen}
        SidebarButtonComponent={SidebarButton} // Pass SidebarButton as a component prop
        // openAddRootTaskDialog={() => setIsAddRootTaskDialogOpen(true)}
      />

      {/* TaskEditDialog for adding root tasks remains at this top level */}
      <TaskEditDialog
        isOpen={isAddRootTaskDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeAddRootTaskDialog(); // Call store action to close
          }
          // If you need to also handle opening via this, you'd call openAddRootTaskDialog
          // but typically the trigger (button) calls open, and onOpenChange(false) calls close.
        }}
        mode="createRootTask"
        parentId={undefined}
      />
    </aside>
  );
}
// --- END OF FILE components/app-sidebar.tsx ---
