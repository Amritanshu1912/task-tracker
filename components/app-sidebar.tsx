// components/app-sidebar.tsx
"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskEditDialog } from "@/components/task-edit-dialog";

import { SidebarHeader } from "./sidebar/sidebar-header";
import { SidebarMainContent } from "./sidebar/sidebar-main-content";
import type { TaskStore as TaskStoreType } from "@/lib/types";

export const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  className,
  badge,
  tooltip,
  isSidebarOpen,
  ...props
}: {
  icon?: React.ElementType;
  label: string;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "ghost" | "outline" | "default" | "secondary" | "destructive";
  className?: string;
  badge?: string | number;
  tooltip?: string;
  isSidebarOpen: boolean;
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
          : "w-10 h-10 p-0 mx-auto flex items-center justify-center",
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
      <TooltipProvider delayDuration={300}>
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
  const isSidebarOpen = useTaskStore(
    (state: TaskStoreType) => state.isSidebarOpen
  );
  const toggleSidebar = useTaskStore(
    (state: TaskStoreType) => state.toggleSidebar
  );
  const isAddTaskDialogOpen = useTaskStore(
    (state: TaskStoreType) => state.isAddTaskDialogOpen
  );
  const addTaskDialogPayload = useTaskStore(
    (state: TaskStoreType) => state.addTaskDialogPayload
  );
  const closeAddTaskDialog = useTaskStore(
    (state: TaskStoreType) => state.closeAddTaskDialog
  );

  return (
    <>
      <aside
        className={cn(
          "fixed top-16 left-0 z-30",
          "flex flex-col print:hidden",
          "h-[calc(100vh-4rem)]",
          "bg-card border-r border-border/50",
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-72" : "w-16"
        )}
        aria-label="Control Panel Sidebar"
      >
        <SidebarHeader
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar} // toggleSidebar is a stable reference from store
        />
        <SidebarMainContent
          isSidebarOpen={isSidebarOpen}
          SidebarButtonComponent={SidebarButton}
        />
      </aside>
      <TaskEditDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeAddTaskDialog();
        }}
        mode="createRootTask"
        parentId={undefined}
        taskNumber={addTaskDialogPayload?.taskNumber} // Pass the number here
      />
    </>
  );
}
