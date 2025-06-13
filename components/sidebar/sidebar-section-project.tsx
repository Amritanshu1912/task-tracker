// components/sidebar/sidebar-section-project.tsx
"use client";

import React, { useState } from "react";
import { useTaskStore } from "@/lib/store";
import type { TaskStore as TaskStoreType } from "@/lib/types";

import { SidebarProjectList } from "./sidebar-project-list";
import type { SidebarButton as SidebarButtonType } from "../app-sidebar"; // Adjust path if needed
import { Layers, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarSectionProjectProps {
  isSidebarOpen: boolean;
  SidebarButtonComponent: typeof SidebarButtonType;
}

export function SidebarSectionProject({
  isSidebarOpen,
  SidebarButtonComponent,
}: SidebarSectionProjectProps) {
  const addProject = useTaskStore((state: TaskStoreType) => state.addProject);
  const projectsCount = useTaskStore(
    (state: TaskStoreType) => state.projects.length
  );
  const toggleSidebar = useTaskStore(
    (state: TaskStoreType) => state.toggleSidebar
  );

  const [isSectionContentVisible, setIsSectionContentVisible] = useState(true);

  const handleAddNewProjectFromCollapsed = () => {
    addProject(); // This sets active and editing project ID
    // No need to call setEditingProjectId separately if addProject handles it
    toggleSidebar(); // Expand the sidebar
    // The useEffect in SidebarProjectItem for the new project will handle focus
  };

  const handleAddNewProjectFromExpanded = (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.stopPropagation();
    addProject();
    if (!isSectionContentVisible) setIsSectionContentVisible(true);
  };

  const handleToggleCollapse = () => {
    if (isSidebarOpen) {
      setIsSectionContentVisible(!isSectionContentVisible);
    }
  };

  if (!isSidebarOpen) {
    return (
      <div className="flex flex-col items-center justify-center mb-2">
        <SidebarButtonComponent
          icon={Plus}
          label=""
          onClick={handleAddNewProjectFromCollapsed}
          isSidebarOpen={false}
          tooltip="Add New Project"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", isSidebarOpen ? "mb-1" : "mb-2")}>
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
        aria-controls="sidebar-section-projects-content"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-accent-foreground transition-colors">
            Projects{" "}
            <span className="text-primary/80 font-normal">
              ({projectsCount})
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <SidebarButtonComponent
            icon={Plus}
            label=""
            // --- MODIFY THE LINE BELOW ---
            onClick={handleAddNewProjectFromExpanded}
            isSidebarOpen={isSidebarOpen}
            tooltip="Add New Project"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
          />
          {isSectionContentVisible ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isSectionContentVisible && (
          <motion.div
            key="content"
            id="sidebar-section-projects-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginTop: "0.125rem" },
              collapsed: { opacity: 0, height: 0, marginTop: "0" },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            style={{ minHeight: projectsCount === 0 ? "auto" : "50px" }}
          >
            <SidebarProjectList isSidebarOpen={isSidebarOpen} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
