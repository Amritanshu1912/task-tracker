// components/sidebar/sidebar-filter-controls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CircleDot, CheckCircle } from "lucide-react"; // Ensure CheckCircle or CheckCircle2
import { useTaskStore } from "@/lib/store";
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface SidebarFilterControlsProps {
  isSidebarOpen: boolean;
}

// Reusable badge rendering logic
const FilterBadge = ({
  label,
  isActive,
  onToggle,
  icon,
}: {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) => (
  <Badge
    variant={isActive ? "default" : "outline"}
    onClick={onToggle}
    className={cn(
      "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
      "hover:scale-105 active:scale-95 py-1 px-2 rounded-full",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm border-primary/50"
        : "hover:bg-accent hover:text-accent-foreground border-border"
    )}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onToggle();
    }}
    aria-pressed={isActive}
    aria-label={`Filter by ${label}`}
  >
    {icon}
    {label}
  </Badge>
);

export function SidebarFilterControls({
  isSidebarOpen,
}: SidebarFilterControlsProps) {
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const toggleLabelFilter = useTaskStore((state) => state.toggleLabelFilter);
  const clearLabelFilters = useTaskStore((state) => state.clearLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);
  const toggleStatusFilter = useTaskStore((state) => state.toggleStatusFilter);

  // Hide filter UI entirely if sidebar is collapsed
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Label Filters Section */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-[13px] font-medium text-muted-foreground">
          Labels ({activeLabelFilters.length} active)
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

      <div className="flex flex-wrap gap-1.5 mb-4">
        {AVAILABLE_LABELS.map((label) => (
          <FilterBadge
            key={label}
            label={label}
            isActive={activeLabelFilters.includes(label)}
            onToggle={() => toggleLabelFilter(label)}
            icon={<span className="mr-0.5">{LABEL_EMOJIS[label]}</span>}
          />
        ))}
      </div>

      {/* Status Filters Section */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-[13px] font-medium text-muted-foreground">
          Status
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterBadge
          label="Active"
          isActive={activeStatusFilter === "active"}
          onToggle={() => toggleStatusFilter("active")}
          icon={<CircleDot className="w-3.5 h-3.5" />}
        />
        <FilterBadge
          label="Completed"
          isActive={activeStatusFilter === "completed"}
          onToggle={() => toggleStatusFilter("completed")}
          icon={<CheckCircle className="w-3.5 h-3.5" />}
        />
      </div>
    </>
  );
}
// --- END OF FILE components/sidebar/sidebar-filter-controls.tsx ---
