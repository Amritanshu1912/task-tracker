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
  ChevronDown,
  ChevronRight,
  Tags,
  Settings2,
  Layers,
  Plus,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import type { TaskStore as TaskStoreType } from "@/lib/types";
import { SidebarFilterControls } from "./sidebar-filter-controls";
import type { SidebarButton as SidebarButtonType } from "../app-sidebar";

import { exportToJson, importFromJson } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLabelsDialog } from "../manage-labels-dialog";
import { SidebarProjectList } from "./sidebar-project-list";
import { Button } from "../ui/button";

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
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const SidebarSection = ({
  title,
  icon: Icon,
  children,
  isSidebarOpen,
  defaultOpen = true,
  SidebarButtonComponent,
  headerAction,
  className,
  contentClassName,
}: SidebarSectionProps) => {
  const [isSectionContentVisible, setIsSectionContentVisible] =
    useState(defaultOpen);

  const handleToggleCollapse = useCallback(() => {
    if (isSidebarOpen && title) {
      setIsSectionContentVisible((prev) => !prev);
    }
  }, [isSidebarOpen, title]);

  if (!isSidebarOpen) {
    const firstButtonChild = React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === SidebarButtonComponent
    );

    if (Icon && title) {
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center mb-2",
            className
          )}
        >
          <SidebarButtonComponent
            icon={Icon}
            label=""
            onClick={() => useTaskStore.getState().toggleSidebar()}
            isSidebarOpen={false}
            tooltip={title}
          />
        </div>
      );
    } else if (firstButtonChild && React.isValidElement(firstButtonChild)) {
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center mb-2",
            className
          )}
        >
          {React.cloneElement(firstButtonChild as React.ReactElement<any>, {
            isSidebarOpen: false,
          })}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={cn("space-y-1", isSidebarOpen ? "mb-1" : "mb-2", className)}
    >
      {isSidebarOpen && title && (
        <div
          className="flex items-center justify-between gap-2 h-10 mb-1 cursor-pointer group rounded-md hover:bg-accent/50 px-1 -mx-1"
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
          {/* --- NEW: Render area for the header action and chevron --- */}
          <div className="flex items-center">
            {headerAction}
            {isSectionContentVisible ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            )}
          </div>
        </div>
      )}

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

export function SidebarMainContent({
  isSidebarOpen,
  SidebarButtonComponent,
}: SidebarMainContentProps) {
  const addProject = useTaskStore((state: TaskStoreType) => state.addProject);
  const projectsCount = useTaskStore(
    (state: TaskStoreType) => state.projects.length
  );
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
  const openManageLabelsDialog = useTaskStore(
    (state: TaskStoreType) => state.openManageLabelsDialog
  );

  const handleSave = useCallback(() => {
    saveToLocalStorage();
    toast.success("Progress Saved", {
      description: "Your changes have been saved to local storage.",
    });
  }, [saveToLocalStorage]);

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

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromJson(file);
        } catch (error) {
          console.error("Import initiation failed or was rejected:", error);
        }
      }
    };
    input.click();
  }, []);

  return (
    <>
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out",
          isSidebarOpen ? "px-3 pt-2 pb-4 space-y-2" : "px-2 py-2 space-y-2"
        )}
      >
        {/* --- MODIFIED: Replaced SidebarSectionProject with the generic SidebarSection --- */}
        <SidebarSection
          title={`Projects (${projectsCount})`}
          icon={Layers}
          isSidebarOpen={isSidebarOpen}
          SidebarButtonComponent={SidebarButtonComponent}
          headerAction={
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the section from collapsing
                addProject();
              }}
              className="h-6 w-6 mr-1 text-muted-foreground hover:bg-accent/80 hover:text-primary"
              title="Add New Project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
          // --- NEW: Added contentClassName for better control ---
          contentClassName={cn(isSidebarOpen && "min-h-[50px]")}
        >
          {isSidebarOpen ? ( // Only render the list if sidebar is open
            <SidebarProjectList isSidebarOpen={isSidebarOpen} />
          ) : null}
        </SidebarSection>

        {isSidebarOpen && <Separator className="my-3" />}

        {/* --- Filters Section (from previous step, no changes here) --- */}
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
          defaultOpen={false}
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
          title="Workspace Controls"
          icon={Settings2}
          isSidebarOpen={isSidebarOpen}
          defaultOpen={false}
          SidebarButtonComponent={SidebarButtonComponent}
        >
          <SidebarButtonComponent
            icon={Tags}
            label="Manage Labels"
            onClick={openManageLabelsDialog}
            isSidebarOpen={isSidebarOpen}
            tooltip="Manage Custom Labels"
          />
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
      <ManageLabelsDialog />
    </>
  );
}
