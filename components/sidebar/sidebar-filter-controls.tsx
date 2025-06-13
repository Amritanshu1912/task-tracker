// components/sidebar/sidebar-filter-controls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CircleDot, CheckCircle } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import type { LabelObject, TaskStore as TaskStoreType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarFilterControlsProps {
  isSidebarOpen: boolean;
}

// Reusable badge rendering logic - updated for LabelObject
const FilterBadge = ({
  labelName,
  labelEmoji,
  labelColor, // Added color
  isActive,
  onToggle,
  icon, // For status filters
}: {
  labelName: string;
  labelEmoji?: string;
  labelColor?: string;
  isActive: boolean;
  onToggle: () => void;
  icon?: React.ReactNode; // For status icons
}) => (
  <Badge
    // variant={isActive ? "default" : "outline"} // "default" might be too strong with custom colors
    variant="outline" // Always outline, use custom styles for active state
    onClick={onToggle}
    className={cn(
      "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
      "hover:scale-105 active:scale-95 py-1 px-2 rounded-full border", // Base border
      isActive
        ? "font-semibold ring-1 ring-offset-1 ring-offset-background"
        : "hover:bg-accent hover:text-accent-foreground border-border"
    )}
    style={
      isActive && labelColor
        ? {
            backgroundColor: `${labelColor}4D`, // Active with alpha background
            borderColor: labelColor,
            color: labelColor, // Text color same as label color for active state
          }
        : !isActive && labelColor
        ? {
            // Non-active custom colored label
            backgroundColor: `${labelColor}1A`,
            borderColor: `${labelColor}60`,
            color: labelColor,
          }
        : {}
    }
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onToggle();
    }}
    aria-pressed={isActive}
    aria-label={`Filter by ${labelName}`}
  >
    {icon ? (
      icon
    ) : labelEmoji ? (
      <span className="mr-0.5">{labelEmoji}</span>
    ) : null}
    {labelName}
  </Badge>
);

export function SidebarFilterControls({
  isSidebarOpen,
}: SidebarFilterControlsProps) {
  // --- MODIFY: Fetch customLabels ---
  const customLabels = useTaskStore(
    (state: TaskStoreType) => state.customLabels
  );
  const activeLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.activeLabelFilters
  ); // Now stores IDs
  const toggleLabelFilter = useTaskStore(
    (state: TaskStoreType) => state.toggleLabelFilter
  ); // Takes ID
  const clearLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.clearLabelFilters
  );
  const activeStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.activeStatusFilter
  );
  const toggleStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.toggleStatusFilter
  );

  // Hide filter UI entirely if sidebar is collapsed
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="px-1 pb-1">
      {/* Label Filters Section */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-[13px] font-medium text-muted-foreground">
          Labels
          {activeLabelFilters.length > 0 &&
            ` (${activeLabelFilters.length} active)`}
        </span>
        {activeLabelFilters.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLabelFilters}
            className="h-6 w-6 text-destructive hover:text-destructive"
            title="Clear label filters"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* --- MODIFY: Iterate over customLabels --- */}
      {customLabels.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {customLabels.map((labelObj: LabelObject) => (
            <FilterBadge
              key={labelObj.id}
              labelName={labelObj.name}
              labelEmoji={labelObj.emoji}
              labelColor={labelObj.color}
              isActive={activeLabelFilters.includes(labelObj.id)}
              onToggle={() => toggleLabelFilter(labelObj.id)} // Pass label ID
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-4 italic">
          No custom labels defined.
        </p>
      )}

      {/* Status Filters Section */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-[13px] font-medium text-muted-foreground">
          Status
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterBadge
          labelName="Active"
          isActive={activeStatusFilter === "active"}
          onToggle={() => toggleStatusFilter("active")}
          icon={<CircleDot className="w-3.5 h-3.5" />}
        />
        <FilterBadge
          labelName="Completed"
          isActive={activeStatusFilter === "completed"}
          onToggle={() => toggleStatusFilter("completed")}
          icon={<CheckCircle className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
}
// --- END OF FILE components/sidebar/sidebar-filter-controls.tsx ---
