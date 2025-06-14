// components/sidebar/sidebar-filter-controls.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  CircleDot,
  CheckCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import type { LabelObject, TaskStore as TaskStoreType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// --- NEW: Reusable collapsible subsection for filters ---
const FilterSubSection = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div
        className="flex items-center justify-between h-7 mb-1 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <span className="text-[13px] font-medium text-muted-foreground group-hover:text-accent-foreground">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {action}
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent-foreground" />
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginTop: "0.125rem" },
              collapsed: { opacity: 0, height: 0, marginTop: "0" },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden p-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SidebarFilterControlsProps {
  isSidebarOpen: boolean;
}

const FilterBadge = ({
  labelName,
  labelEmoji,
  labelColor,
  isActive,
  onToggle,
  icon,
}: {
  labelName: string;
  labelEmoji?: string;
  labelColor?: string;
  isActive: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) => (
  <Badge
    onClick={onToggle}
    variant="outline"
    className={cn(
      "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
      "hover:opacity-80 active:scale-95 py-1 px-2.5 rounded-full border-2",
      "focus-visible-ring",
      // Ternary logic to handle different badge types
      labelColor
        ? // Styles for COLORED labels (This logic is now simpler because we don't need to define the unselected state)
          isActive && "text-white"
        : // Styles for STATUS filters
        isActive
        ? "bg-accent border-primary/50 text-primary" // This now correctly OVERRIDES the neutral 'outline' variant
        : "text-muted-foreground" // When inactive, just use the default 'outline' text color
    )}
    style={
      labelColor
        ? {
            backgroundColor: isActive ? `${labelColor}80` : `${labelColor}20`,
            borderColor: isActive ? labelColor : `${labelColor}80`,
            color: isActive ? "#fff" : `${labelColor}95`,
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
  const customLabels = useTaskStore(
    (state: TaskStoreType) => state.customLabels
  );
  const activeLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.activeLabelFilters
  );
  const toggleLabelFilter = useTaskStore(
    (state: TaskStoreType) => state.toggleLabelFilter
  );
  const clearLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.clearLabelFilters
  );
  const activeStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.activeStatusFilter
  );
  const toggleStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.toggleStatusFilter
  );

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="px-1 pb-1 space-y-2">
      {/* --- MODIFIED: Label Filters Section now uses FilterSubSection --- */}
      <FilterSubSection
        title={`Labels${
          activeLabelFilters.length > 0 ? ` (${activeLabelFilters.length})` : ""
        }`}
        action={
          activeLabelFilters.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // prevent collapsing section
                clearLabelFilters();
              }}
              className="h-6 w-6 text-destructive hover:text-destructive"
              title="Clear label filters"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )
        }
      >
        {customLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {customLabels.map((labelObj: LabelObject) => (
              <FilterBadge
                key={labelObj.id}
                labelName={labelObj.name}
                labelEmoji={labelObj.emoji}
                labelColor={labelObj.color}
                isActive={activeLabelFilters.includes(labelObj.id)}
                onToggle={() => toggleLabelFilter(labelObj.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No custom labels defined.
          </p>
        )}
      </FilterSubSection>

      {/* --- MODIFIED: Status Filters Section now uses FilterSubSection --- */}
      <FilterSubSection title="Status">
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
      </FilterSubSection>
    </div>
  );
}
