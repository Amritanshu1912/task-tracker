// components/sidebar/sidebar-view-controls.tsx

"use client";

import {
  Eye,
  EyeOff,
  ChevronsUpDown,
  Layers2,
  Layers3,
  LayoutList,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { SidebarSection } from "./sidebar-components";
import { SidebarButton } from "./sidebar-components";

interface SidebarViewControlsProps {
  isSidebarOpen: boolean;
}

export function SidebarViewControls({
  isSidebarOpen,
}: SidebarViewControlsProps) {
  const toggleAllNotes = useTaskStore((state) => state.toggleAllNotes);
  const areAllNotesCollapsed = useTaskStore(
    (state) => state.areAllNotesCollapsed
  );
  const setMaxVisibleDepth = useTaskStore((state) => state.setMaxVisibleDepth);

  return (
    <SidebarSection
      title="View Controls"
      icon={Eye}
      isSidebarOpen={isSidebarOpen}
    >
      <SidebarButton
        icon={areAllNotesCollapsed ? Eye : EyeOff}
        label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
        onClick={toggleAllNotes}
        tooltip={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
        isSidebarOpen={isSidebarOpen}
      />
      <SidebarButton
        icon={ChevronsUpDown}
        label="Expand All"
        onClick={() => setMaxVisibleDepth(null)}
        tooltip="Expand All Tasks"
        isSidebarOpen={isSidebarOpen}
      />
      <SidebarButton
        icon={LayoutList}
        label="Collapse Level 1+"
        onClick={() => setMaxVisibleDepth(0)}
        tooltip="Show only top-level tasks"
        isSidebarOpen={isSidebarOpen}
      />
      <SidebarButton
        icon={Layers2}
        label="Collapse Level 2+"
        onClick={() => setMaxVisibleDepth(1)}
        tooltip="Show levels 0-1, collapse 2+"
        isSidebarOpen={isSidebarOpen}
      />
      <SidebarButton
        icon={Layers3}
        label="Collapse Level 3+"
        onClick={() => setMaxVisibleDepth(2)}
        tooltip="Show levels 0-2, collapse 3+"
        isSidebarOpen={isSidebarOpen}
      />
    </SidebarSection>
  );
}
