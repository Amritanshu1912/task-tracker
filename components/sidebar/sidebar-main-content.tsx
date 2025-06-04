// --- START OF FILE components/sidebar/sidebar-main-content.tsx ---
"use client";

import type React from "react";
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
} from "lucide-react"; // Icons needed here
import { useTaskStore } from "@/lib/store";

// Import the specific filter controls component
import { SidebarFilterControls } from "./sidebar-filter-controls";
import type { SidebarButton as SidebarButtonType } from "../app-sidebar"; // Type for passed button

interface SidebarMainContentProps {
  isSidebarOpen: boolean;
  SidebarButtonComponent: typeof SidebarButtonType; // Pass the SidebarButton component
  // openAddRootTaskDialog: () => void;
}

// Local SidebarSection helper for this content area
const SidebarSection = ({
  title,
  icon: Icon,
  children,
  isSidebarOpen, // Needs to know if sidebar is open to show title
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  isSidebarOpen: boolean;
}) => (
  <div className={cn("space-y-1", isSidebarOpen ? "mb-4" : "mb-2")}>
    {" "}
    {/* Consistent spacing */}
    {isSidebarOpen &&
      title && ( // Only show title if sidebar is open and title is provided
        <div className="flex items-center gap-2 h-7 mb-1.5">
          {" "}
          {/* Matches filter subheader style */}
          {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
    <div
      className={
        isSidebarOpen ? "space-y-1.5" : "space-y-2 flex flex-col items-center"
      }
    >
      {children}
    </div>
  </div>
);

export function SidebarMainContent({
  isSidebarOpen,
  SidebarButtonComponent,
}: // openAddRootTaskDialog,
SidebarMainContentProps) {
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
        "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar", // Added custom-scrollbar class
        "transition-all duration-200 ease-in-out", // Use 'all' for p transitions
        isSidebarOpen ? "p-4 space-y-4" : "p-2 space-y-3" // Adjusted padding and spacing when collapsed
      )}
    >
      {/* Order: Manage Tasks, Filters, View Controls */}
      <SidebarSection
        title="Manage Tasks"
        icon={Layers}
        isSidebarOpen={isSidebarOpen}
      >
        <SidebarButtonComponent
          icon={Plus}
          label="Add New Task"
          onClick={openAddRootTaskDialogGlobal}
          isSidebarOpen={isSidebarOpen}
          tooltip="Add New Task"
        />
      </SidebarSection>

      {<Separator className="my-3" />}

      <SidebarSection
        title={isSidebarOpen ? "Filters" : ""}
        icon={FilterIcon}
        isSidebarOpen={isSidebarOpen}
      >
        <SidebarFilterControls isSidebarOpen={isSidebarOpen} />
      </SidebarSection>

      {isSidebarOpen && <Separator className="my-3" />}

      <SidebarSection
        title="View Controls"
        icon={Eye}
        isSidebarOpen={isSidebarOpen}
      >
        <SidebarButtonComponent
          icon={areAllNotesCollapsed ? Eye : EyeOff}
          label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
          onClick={toggleAllNotes}
          isSidebarOpen={isSidebarOpen}
          tooltip={areAllNotesCollapsed ? "Show All Notes" : "Hide All Notes"}
        />
        <SidebarButtonComponent
          icon={ChevronsUpDown} // More generic for "Expand All"
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
