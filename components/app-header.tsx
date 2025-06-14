// components/app-header.tsx

"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/lib/store";
import type { TaskStore as TaskStoreType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Zap, Plus, CheckCircle, Target, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable StatItem component for the header
const StatItem = ({
  icon: Icon,
  value,
  label,
  iconClassName,
  title,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  iconClassName?: string;
  title?: string;
}) => (
  <div className="flex items-center text-center" title={title}>
    <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
      <Icon className={cn("h-4 w-4", iconClassName)} />
      <span>{value}</span>
      <div className="text-[13px] text-muted-foreground leading-tight">
        {label}
      </div>
    </div>
  </div>
);

export function AppHeader() {
  const activeProjectId = useTaskStore(
    (state: TaskStoreType) => state.activeProjectId
  );
  const projects = useTaskStore((state: TaskStoreType) => state.projects);
  const stats = useTaskStore((state: TaskStoreType) => state.stats);
  const openAddTaskDialog = useTaskStore(
    (state: TaskStoreType) => state.openAddTaskDialog
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const handleAddTaskToProject = () => {
    if (activeProject) {
      const newRootTaskNumber = (activeProject.tasks.length + 1).toString();
      openAddTaskDialog({ taskNumber: newRootTaskNumber });
    } else {
      useTaskStore.getState().openAddTaskDialog();
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl print:hidden",
        "h-16"
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Left Section: Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">
              Task Tracker
            </h1>
          </div>
        </div>

        {/* Center Section: Active Project Name & Add Task Button */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4">
          {activeProject ? (
            <h2
              className="text-base sm:text-lg font-semibold truncate text-foreground max-w-[150px] sm:max-w-[250px] md:max-w-xs lg:max-w-sm xl:max-w-md"
              title={activeProject.name}
            >
              {activeProject.name}
            </h2>
          ) : (
            <p className="text-base sm:text-lg italic text-muted-foreground">
              No Project Selected
            </p>
          )}
        </div>

        {/* Right Section: Task Statistics (styled like old SidebarStats) */}
        <div className="flex align-center justify-center gap-3 sm:gap-4 flex-shrink-0">
          {activeProject && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 sm:px-3 border border-gray-700" // Slightly smaller padding on small screens
              onClick={handleAddTaskToProject}
              title="Add new task to this project"
            >
              <Plus className="h-4 w-4 sm:mr-1.5" />
              {/* Icon only on very small, then icon + text */}
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          )}
          <StatItem
            icon={CheckCircle}
            value={stats.completed}
            label="Done"
            iconClassName="text-green-500"
            title={`${stats.completed} tasks completed`}
          />
          <StatItem
            icon={Circle}
            value={stats.total}
            label="Total"
            // iconClassName="text-blue-500"
            title={`${stats.total} total tasks`}
          />
          <StatItem
            icon={Target}
            value={`${stats.percentage}%`}
            label="Progress"
            iconClassName="text-primary"
            title={`${stats.percentage}% project progress`}
          />
        </div>
      </div>
    </header>
  );
}
