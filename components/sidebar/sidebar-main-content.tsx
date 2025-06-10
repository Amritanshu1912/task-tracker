// components/sidebar/sidebar-main-content.tsx
"use client";

import React, { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FilterIcon,
  Eye,
  EyeOff,
  ChevronsUpDown,
  LayoutList,
  Layers2,
  Layers3,
  Save,
  FileDown,
  FileUp,
  DatabaseZap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import type { TaskStore as TaskStoreType } from "@/lib/types";
import { SidebarFilterControls } from "./sidebar-filter-controls";
import type { SidebarButton as SidebarButtonType } from "../app-sidebar";
import { SidebarSectionProject } from "./sidebar-section-project";
import { exportToJson, importFromJson } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarMainContentProps {
  isSidebarOpen: boolean;
  SidebarButtonComponent: typeof SidebarButtonType;
}

interface SidebarSectionProps {
  title?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  isSidebarOpen: boolean;
  defaultOpen?: boolean;
  SidebarButtonComponent: typeof SidebarButtonType;
  className?: string;
  contentClassName?: string;
}

/**
 * Renders a collapsible section within the sidebar.
 * When the sidebar is collapsed, it attempts to show a representative button or icon.
 */
const SidebarSection = ({
  title,
  icon: Icon,
  children,
  isSidebarOpen,
  defaultOpen = true,
  SidebarButtonComponent,
  className,
  contentClassName,
}: SidebarSectionProps) => {
  const [isSectionContentVisible, setIsSectionContentVisible] =
    useState(defaultOpen);

  // Handles toggling the visibility of the section content
  const handleToggleCollapse = useCallback(() => {
    // Only allow toggling if the sidebar is open and the section has a title
    if (isSidebarOpen && title) {
      setIsSectionContentVisible((prev) => !prev);
    }
  }, [isSidebarOpen, title]);

  // Render a collapsed state when the main sidebar is closed
  if (!isSidebarOpen) {
    // Find the first SidebarButton child to display when collapsed
    const firstButtonChild = React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === SidebarButtonComponent
    );

    if (Icon && title) {
      // If the section has a title and icon, display that icon as a button
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center mb-2",
            className
          )}
        >
          <SidebarButtonComponent
            icon={Icon}
            label="" // Label is empty as only icon is shown
            onClick={() => useTaskStore.getState().toggleSidebar()} // Click to open sidebar
            isSidebarOpen={false}
            tooltip={title} // Tooltip provides context
          />
        </div>
      );
    } else if (firstButtonChild && React.isValidElement(firstButtonChild)) {
      // If no icon/title, render the first SidebarButton child (adapted for collapsed state)
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center mb-2",
            className
          )}
        >
          {React.cloneElement(firstButtonChild as React.ReactElement<any>, {
            isSidebarOpen: false, // Ensure the cloned button is also in collapsed state
          })}
        </div>
      );
    }
    return null; // Don't render anything if no appropriate collapsed representation
  }

  // Render expanded section when the sidebar is open
  return (
    <div
      className={cn("space-y-1", isSidebarOpen ? "mb-1" : "mb-2", className)}
    >
      {/* Section header with title and collapse toggle */}
      {isSidebarOpen && title && (
        <div
          className="flex items-center justify-between gap-2 h-7 mb-1 cursor-pointer group rounded-md hover:bg-accent/50 px-1 -mx-1"
          onClick={handleToggleCollapse}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggleCollapse();
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isSectionContentVisible}
          aria-controls={`sidebar-section-content-${title
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-accent-foreground transition-colors">
              {title}
            </h3>
          </div>
          {isSectionContentVisible ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          )}
        </div>
      )}

      {/* Animated content area for the section */}
      {isSidebarOpen && (
        <AnimatePresence initial={false}>
          {isSectionContentVisible && (
            <motion.div
              key="content"
              id={
                title
                  ? `sidebar-section-content-${title
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`
                  : undefined
              }
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: {
                  opacity: 1,
                  height: "auto",
                  marginTop: title ? "0.125rem" : "0",
                },
                collapsed: { opacity: 0, height: 0, marginTop: "0" },
              }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className={cn("overflow-hidden", contentClassName)}
            >
              <div
                className={cn(
                  isSidebarOpen && title ? "space-y-1.5" : "space-y-1"
                )}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

/**
 * Main content area of the sidebar, containing various sections like projects, filters, and data management.
 */
export function SidebarMainContent({
  isSidebarOpen,
  SidebarButtonComponent,
}: SidebarMainContentProps) {
  // Select only the necessary state and actions from the store for optimal re-renders.
  const toggleAllNotes = useTaskStore(
    (state: TaskStoreType) => state.toggleAllNotes
  );
  const areAllNotesCollapsed = useTaskStore(
    (state: TaskStoreType) => state.areAllNotesCollapsed
  );
  const setMaxVisibleDepth = useTaskStore(
    (state: TaskStoreType) => state.setMaxVisibleDepth
  );
  const saveToLocalStorage = useTaskStore(
    (state: TaskStoreType) => state.saveToLocalStorage
  );
  const projects = useTaskStore((state: TaskStoreType) => state.projects);
  const activeProjectId = useTaskStore(
    (state: TaskStoreType) => state.activeProjectId
  );

  // Callback to handle saving progress to local storage.
  const handleSave = useCallback(() => {
    saveToLocalStorage();
    toast.success("Progress Saved", {
      description: "Your changes have been saved to local storage.",
    });
  }, [saveToLocalStorage]);

  // Callback to handle exporting the active project's data.
  const handleExport = useCallback(() => {
    const activeProject = projects.find((p) => p.id === activeProjectId);
    if (!activeProject) {
      toast.error("Export Failed", {
        description: "No active project to export.",
      });
      return;
    }
    exportToJson({
      projectName: activeProject.name,
      tasks: activeProject.tasks,
    });
    toast.info("Active Project Exported", {
      description: `"${activeProject.name}" data downloaded as JSON.`,
    });
  }, [projects, activeProjectId]);

  // Callback to handle importing project data from a JSON file.
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromJson(file); // Utility handles the state update and toasts internally
        } catch (error) {
          // Error handling for import initiation (e.g., user cancels file dialog)
          console.error("Import initiation failed or was rejected:", error);
        }
      }
    };
    input.click();
  }, []);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out",
        isSidebarOpen ? "px-3 pt-2 pb-4 space-y-2" : "px-2 py-2 space-y-2"
      )}
    >
      <SidebarSectionProject
        isSidebarOpen={isSidebarOpen}
        SidebarButtonComponent={SidebarButtonComponent}
      />

      {isSidebarOpen && <Separator className="my-3" />}

      <SidebarSection
        title="Filters"
        icon={FilterIcon}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={true}
        SidebarButtonComponent={SidebarButtonComponent}
      >
        <SidebarFilterControls isSidebarOpen={isSidebarOpen} />
      </SidebarSection>

      {isSidebarOpen && <Separator className="my-3" />}

      <SidebarSection
        title="View Controls"
        icon={Eye}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={false} // Default to closed for less clutter
        SidebarButtonComponent={SidebarButtonComponent}
      >
        <SidebarButtonComponent
          icon={areAllNotesCollapsed ? Eye : EyeOff}
          label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
          onClick={toggleAllNotes}
          isSidebarOpen={isSidebarOpen}
          tooltip={areAllNotesCollapsed ? "Show All Notes" : "Hide All Notes"}
        />
        <SidebarButtonComponent
          icon={ChevronsUpDown}
          label="Expand All Tasks"
          onClick={() => setMaxVisibleDepth(null)}
          isSidebarOpen={isSidebarOpen}
          tooltip="Expand All Tasks"
        />
        <SidebarButtonComponent
          icon={LayoutList}
          label="Collapse Lvl 1+"
          onClick={() => setMaxVisibleDepth(0)}
          isSidebarOpen={isSidebarOpen}
          tooltip="Collapse to Level 1"
        />
        <SidebarButtonComponent
          icon={Layers2}
          label="Collapse Lvl 2+"
          onClick={() => setMaxVisibleDepth(1)}
          isSidebarOpen={isSidebarOpen}
          tooltip="Collapse to Level 2"
        />
        <SidebarButtonComponent
          icon={Layers3}
          label="Collapse Lvl 3+"
          onClick={() => setMaxVisibleDepth(2)}
          isSidebarOpen={isSidebarOpen}
          tooltip="Collapse to Level 3"
        />
      </SidebarSection>

      {isSidebarOpen && <Separator className="my-3" />}

      <SidebarSection
        title="Data Management"
        icon={DatabaseZap}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={false} // Default to closed
        SidebarButtonComponent={SidebarButtonComponent}
      >
        <SidebarButtonComponent
          icon={Save}
          label="Save Progress"
          onClick={handleSave}
          isSidebarOpen={isSidebarOpen}
          tooltip="Save Current State"
        />
        <SidebarButtonComponent
          icon={FileDown}
          label="Export Active Project"
          onClick={handleExport}
          isSidebarOpen={isSidebarOpen}
          tooltip="Export Active Project as JSON"
        />
        <SidebarButtonComponent
          icon={FileUp}
          label="Import Project"
          onClick={handleImport}
          isSidebarOpen={isSidebarOpen}
          tooltip="Import Project from JSON"
        />
      </SidebarSection>
    </div>
  );
}
