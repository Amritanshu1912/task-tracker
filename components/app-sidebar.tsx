// components/app-sidebar.tsx

"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  EyeOff,
  FilterIcon,
  ChevronsDownUp,
  ChevronsUpDown,
  Settings,
  Layers,
  PanelLeftClose,
  PanelRightOpen,
  CircleDot,
  CheckCircle2,
  CheckCircle,
  Circle,
  Target,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { StatusFilterState } from "@/lib/types";

// AppSidebar component provides navigation, filters, and settings for the task tracker.
export function AppSidebar() {
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);
  const addSection = useTaskStore((state) => state.addSection);
  const toggleAllNotes = useTaskStore((state) => state.toggleAllNotes);
  const areAllNotesCollapsed = useTaskStore(
    (state) => state.areAllNotesCollapsed
  );
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const toggleLabelFilter = useTaskStore((state) => state.toggleLabelFilter);
  const clearLabelFilters = useTaskStore((state) => state.clearLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);
  const toggleStatusFilter = useTaskStore((state) => state.toggleStatusFilter);
  const setMaxVisibleDepth = useTaskStore((state) => state.setMaxVisibleDepth);
  const stats = useTaskStore((state) => state.stats);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState("📋");
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);

  // Handles adding a new task section.
  const handleAddSection = useCallback(() => {
    if (newSectionName.trim()) {
      const sectionId =
        newSectionName.toLowerCase().replace(/\s+/g, "-") ||
        `section-${crypto.randomUUID().slice(0, 8)}`;
      addSection(sectionId, {
        title: newSectionName,
        icon: newSectionIcon || "📋",
        description: `Tasks for ${newSectionName}`,
        tasks: [],
      });
      setNewSectionName("");
      setNewSectionIcon("📋");
      setIsAddSectionDialogOpen(false);
    }
  }, [newSectionName, newSectionIcon, addSection]);

  // Renders a section header with an icon and title.
  const SidebarSection = ({
    title,
    icon: Icon,
    children,
    className,
  }: {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-0">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );

  // Renders a stylized button for the sidebar.
  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "ghost",
    className,
    badge,
    ...props
  }: {
    icon?: React.ElementType;
    label: string;
    onClick?: () => void;
    variant?: "ghost" | "outline" | "default" | "secondary" | "destructive";
    className?: string;
    badge?: string | number;
    [key: string]: any;
  }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 h-9 px-3 font-normal",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="truncate">{label}</span>
      {badge && (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Button>
  );

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 z-30",
        "flex flex-col print:hidden",
        "h-[calc(100vh-4rem)]",
        "bg-card border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-72" : "w-16"
      )}
      aria-label="Control Panel Sidebar"
    >
      {/* Sidebar header with title and toggle button. */}
      <div
        className={cn(
          "flex items-center border-b border-border/50 flex-shrink-0",
          isSidebarOpen
            ? "justify-between px-4 py-3 h-16"
            : "justify-center py-3 h-16"
        )}
      >
        {isSidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm truncate">Control Panel</h2>
              <p className="text-xs text-muted-foreground truncate">
                Manage workspace
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8 flex-shrink-0", isSidebarOpen ? "ml-2" : "")}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-pressed={isSidebarOpen}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
          ) : (
            <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Scrollable content area for sidebar sections. */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "transition-opacity duration-200 ease-in-out",
          isSidebarOpen
            ? "opacity-100 p-4 space-y-6"
            : "opacity-0 p-0 pointer-events-none"
        )}
        aria-hidden={!isSidebarOpen}
      >
        {isSidebarOpen && (
          <div className="bg-muted/30 border-b border-border/30 flex-shrink-0 -mx-4 mt-[-1rem] mb-3">
            <div className="grid grid-cols-3 gap-3 text-center py-3 px-4">
              <div>
                <div className="text-lg font-bold text-success">
                  {stats.completed}
                </div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {stats.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>
        )}

        <SidebarSection title="View Controls" icon={Eye}>
          <SidebarButton
            icon={areAllNotesCollapsed ? Eye : EyeOff}
            label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
            onClick={toggleAllNotes}
          />
          <Separator className="my-2" />
          <SidebarButton
            icon={ChevronsDownUp}
            label="Expand All"
            onClick={() => setMaxVisibleDepth(null)}
          />
          <SidebarButton
            icon={ChevronsUpDown}
            label="Collapse Level 1+"
            onClick={() => setMaxVisibleDepth(0)}
          />
          <SidebarButton
            icon={ChevronsUpDown}
            label="Collapse Level 2+"
            onClick={() => setMaxVisibleDepth(1)}
          />
          <SidebarButton
            icon={ChevronsUpDown}
            label="Collapse Level 3+"
            onClick={() => setMaxVisibleDepth(2)}
          />
        </SidebarSection>

        <SidebarSection title="Content" icon={Layers}>
          <Dialog
            open={isAddSectionDialogOpen}
            onOpenChange={setIsAddSectionDialogOpen}
          >
            <DialogTrigger asChild>
              <SidebarButton icon={Plus} label="Add Section" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-icon" className="text-right">
                    Icon
                  </Label>
                  <Input
                    id="section-icon"
                    value={newSectionIcon}
                    onChange={(e) => setNewSectionIcon(e.target.value)}
                    placeholder="📋"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="section-name"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Section name"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddSectionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarSection>

        <SidebarSection title="Filters" icon={FilterIcon}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Labels ({activeLabelFilters.length} active)
            </span>
            {activeLabelFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLabelFilters}
                className="h-6 px-1.5 text-xs text-destructive hover:text-destructive"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AVAILABLE_LABELS.map((label) => {
              const isSelected = activeLabelFilters.includes(label);
              return (
                <Badge
                  key={label}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleLabelFilter(label)}
                  className={cn(
                    "cursor-pointer text-xs transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {LABEL_EMOJIS[label]} {label}
                </Badge>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-1 mt-4">
            <span className="text-sm font-medium text-muted-foreground mt-4">
              Status
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge
              variant={activeStatusFilter === "active" ? "default" : "outline"}
              onClick={() => toggleStatusFilter("active")}
              className={cn(
                "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
                "hover:scale-105 active:scale-95 py-1 px-2",
                activeStatusFilter === "active"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  toggleStatusFilter("active");
              }}
              aria-pressed={activeStatusFilter === "active"}
              aria-label="Filter by Active status"
            >
              <CircleDot className="w-3.5 h-3.5" />
              Active
            </Badge>
            <Badge
              variant={
                activeStatusFilter === "completed" ? "default" : "outline"
              }
              onClick={() => toggleStatusFilter("completed")}
              className={cn(
                "cursor-pointer text-xs transition-all duration-200 flex items-center gap-1.5",
                "hover:scale-105 active:scale-95 py-1 px-2",
                activeStatusFilter === "completed"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  toggleStatusFilter("completed");
              }}
              aria-pressed={activeStatusFilter === "completed"}
              aria-label="Filter by Completed status"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </Badge>
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
