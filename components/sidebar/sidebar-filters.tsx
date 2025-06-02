// components/sidebar/sidebar-filters.tsx

"use client";

import { Button } from "@/components/ui/button";
import { FilterIcon, CircleDot, CheckCircle, Trash2 } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels";
import { SidebarSection } from "./sidebar-components";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarFiltersProps {
  isSidebarOpen: boolean;
}

export function SidebarFilters({ isSidebarOpen }: SidebarFiltersProps) {
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const toggleLabelFilter = useTaskStore((state) => state.toggleLabelFilter);
  const clearLabelFilters = useTaskStore((state) => state.clearLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);
  const toggleStatusFilter = useTaskStore((state) => state.toggleStatusFilter);

  if (!isSidebarOpen) return null;

  // Shared badge class string
  const baseBadgeClasses = cn(
    "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
    "active:scale-95 py-1 px-2 rounded-full"
  );

  // Common ARIA and keyboard props for interactive badges
  const getInteractiveProps = (
    isSelected: boolean,
    onKeyActivate: () => void
  ) => ({
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") onKeyActivate();
    },
    "aria-pressed": isSelected,
  });

  // Render a reusable badge for filters
  const renderFilterBadge = ({
    label,
    icon,
    isSelected,
    onClick,
    ariaLabel,
    iconClassName,
  }: {
    label: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    ariaLabel: string;
    iconClassName?: string;
  }) => (
    <Badge
      key={label}
      variant={isSelected ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        baseBadgeClasses,
        isSelected
          ? "bg-primary text-primary-foreground shadow-sm border-primary/50"
          : "hover:bg-accent hover:text-accent-foreground border-border"
      )}
      aria-label={ariaLabel}
      {...getInteractiveProps(isSelected, onClick)}
    >
      {icon}
      {label}
    </Badge>
  );

  return (
    <SidebarSection
      title="Filters"
      icon={FilterIcon}
      isSidebarOpen={isSidebarOpen}
    >
      {/* --- Label Filters --- */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
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
        {AVAILABLE_LABELS.map((label) =>
          renderFilterBadge({
            label,
            icon: <span className="mr-0.5">{LABEL_EMOJIS[label]}</span>,
            isSelected: activeLabelFilters.includes(label),
            onClick: () => toggleLabelFilter(label),
            ariaLabel: `Filter by label ${label}`,
          })
        )}
      </div>

      {/* --- Status Filters --- */}
      <div className="flex items-center justify-between h-7 mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Status
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {renderFilterBadge({
          label: "Active",
          icon: <CircleDot className="w-3.5 h-3.5" />,
          isSelected: activeStatusFilter === "active",
          onClick: () => toggleStatusFilter("active"),
          ariaLabel: "Filter by Active status",
        })}
        {renderFilterBadge({
          label: "Completed",
          icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
          isSelected: activeStatusFilter === "completed",
          onClick: () => toggleStatusFilter("completed"),
          ariaLabel: "Filter by Completed status",
        })}
      </div>
    </SidebarSection>
  );
}
