// components/sidebar/sidebar-main-content.tsx
"use client";

// import type React from "react";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Layers,
  FilterIcon,
  Eye,
  Plus,
  EyeOff,
  ChevronsUpDown,
  LayoutList,
  Layers2,
  Layers3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";

import { SidebarFilterControls } from "./sidebar-filter-controls";
import type { SidebarButton as SidebarButtonType } from "../app-sidebar";

interface SidebarMainContentProps {
  isSidebarOpen: boolean;
  SidebarButtonComponent: typeof SidebarButtonType;
}

// MODIFIED: SidebarSection now accepts SidebarButtonComponent for its icon-only mode
const SidebarSection = ({
  title,
  icon: Icon,
  children,
  isSidebarOpen,
  defaultOpen = true,
  SidebarButtonComponent, // ADDED this prop
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  isSidebarOpen: boolean;
  defaultOpen?: boolean;
  SidebarButtonComponent: typeof SidebarButtonType; // ADDED type for the prop
}) => {
  const [isSectionContentVisible, setIsSectionContentVisible] =
    useState(defaultOpen);

  const handleToggleCollapse = () => {
    if (isSidebarOpen) {
      setIsSectionContentVisible(!isSectionContentVisible);
    }
  };

  return (
    <div className={cn("space-y-1", isSidebarOpen ? "mb-1" : "mb-2")}>
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

      {isSidebarOpen && (
        <AnimatePresence initial={false}>
          {isSectionContentVisible && (
            <motion.div
              key="content"
              id={`sidebar-section-content-${title
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto", marginTop: "0.125rem" },
                collapsed: { opacity: 0, height: 0, marginTop: "0" },
              }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className={"space-y-1.5"}>
                {" "}
                {/* Content has consistent spacing when open */}
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!isSidebarOpen && (
        <div className="flex flex-col items-center justify-center">
          {/* Logic for icon-only display.
                If the section is 'Filters', show a specific FilterIcon button.
                Otherwise, try to render the first child if it's a SidebarButtonComponent.
            */}
          {title === "Filters" && Icon ? ( // Special handling for Filters icon
            <SidebarButtonComponent
              icon={Icon} // Use the section's defined icon
              label=""
              onClick={() => useTaskStore.getState().toggleSidebar()} // Example: open sidebar
              isSidebarOpen={false}
              tooltip={title} // Use section title as tooltip
            />
          ) : (
            React.Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === SidebarButtonComponent
              ) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  isSidebarOpen: false,
                });
              }
              return null;
            })?.find(Boolean) // Find the first valid SidebarButtonComponent to render
          )}
        </div>
      )}
    </div>
  );
};

export function SidebarMainContent({
  isSidebarOpen,
  SidebarButtonComponent, // This prop is correctly received here
}: SidebarMainContentProps) {
  const toggleAllNotes = useTaskStore((state) => state.toggleAllNotes);
  const areAllNotesCollapsed = useTaskStore(
    (state) => state.areAllNotesCollapsed
  );
  const setMaxVisibleDepth = useTaskStore((state) => state.setMaxVisibleDepth);
  const openAddRootTaskDialogGlobal = useTaskStore(
    (state) => state.openAddRootTaskDialog
  );

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar",
        "transition-all duration-200 ease-in-out",
        isSidebarOpen ? "px-4 pt-2 pb-4 space-y-2" : "px-2 py-2 space-y-2"
      )}
    >
      <SidebarSection
        title="Manage Tasks"
        icon={Layers}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={true}
        SidebarButtonComponent={SidebarButtonComponent}
      >
        {" "}
        {/* PASS PROP */}
        <SidebarButtonComponent
          icon={Plus}
          label="Add New Task"
          onClick={openAddRootTaskDialogGlobal}
          isSidebarOpen={isSidebarOpen}
          tooltip="Add New Task"
        />
      </SidebarSection>

      {isSidebarOpen && <Separator className="my-2" />}

      <SidebarSection
        title="Filters"
        icon={FilterIcon}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={true}
        SidebarButtonComponent={SidebarButtonComponent}
      >
        {" "}
        {/* PASS PROP */}
        {/* For Filters, the icon-only version will show FilterIcon.
            The content <SidebarFilterControls /> is only rendered when isSidebarOpen is true.
            SidebarFilterControls itself handles not rendering if !isSidebarOpen.
        */}
        <SidebarFilterControls isSidebarOpen={isSidebarOpen} />
      </SidebarSection>

      {isSidebarOpen && <Separator className="my-2" />}

      <SidebarSection
        title="View Controls"
        icon={Eye}
        isSidebarOpen={isSidebarOpen}
        defaultOpen={true}
        SidebarButtonComponent={SidebarButtonComponent}
      >
        {" "}
        {/* PASS PROP */}
        <SidebarButtonComponent
          icon={areAllNotesCollapsed ? Eye : EyeOff}
          label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
          onClick={toggleAllNotes}
          isSidebarOpen={isSidebarOpen}
          tooltip={areAllNotesCollapsed ? "Show All Notes" : "Hide All Notes"}
        />
        <SidebarButtonComponent
          icon={ChevronsUpDown}
          label="Expand All"
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
    </div>
  );
}
// --- END OF FILE components/sidebar/sidebar-main-content.tsx ---
