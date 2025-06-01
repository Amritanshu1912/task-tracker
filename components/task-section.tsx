// components/task-section.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import type { Task, StatusFilterState } from "@/lib/types";
import { TaskItem } from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTaskStore } from "@/lib/store";
import React from "react";

interface TaskSectionProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  tasks: Task[];
}

// Recursively checks if a task or its subtasks match active filters.
export const taskMatchesFilters = (
  task: Task,
  activeLabels: string[],
  activeStatus: StatusFilterState | null
): boolean => {
  let result = false;

  const taskMatchesLabels =
    activeLabels.length === 0 ||
    task.labels.some((label) => activeLabels.includes(label));

  if (activeStatus === "active") {
    if (task.completed) {
      result = false;
    } else {
      if (taskMatchesLabels) {
        result = true;
      } else if (task.subtasks && task.subtasks.length > 0) {
        result = task.subtasks.some((st) =>
          taskMatchesFilters(st, activeLabels, "active")
        );
      } else {
        result = false;
      }
    }
  } else if (activeStatus === "completed") {
    let isExactlyThisTaskAMatch = task.completed && taskMatchesLabels;

    if (isExactlyThisTaskAMatch) {
      result = true;
    } else {
      if (task.subtasks && task.subtasks.length > 0) {
        result = task.subtasks.some((st) =>
          taskMatchesFilters(st, activeLabels, "completed")
        );
      } else {
        result = false;
      }
    }
  } else {
    // No status filter
    if (taskMatchesLabels) {
      result = true;
    } else if (task.subtasks && task.subtasks.length > 0) {
      result = task.subtasks.some((st) =>
        taskMatchesFilters(st, activeLabels, null)
      );
    } else {
      result = false;
    }
  }
  return result;
};

// Renders a section of tasks with filtering, add, and collapse functionality.
// Uses memoization and callbacks for performance.
export const TaskSection = React.memo(function TaskSection({
  id,
  title,
  icon,
  description,
  tasks,
}: TaskSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const addTaskToSection = useTaskStore((state) => state.addTaskToSection);
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);

  // Handler to add a new task to this section.
  const handleAddTask = useCallback(() => {
    addTaskToSection(id, {
      id: crypto.randomUUID(),
      title: "New Task",
      notes: "",
      completed: false,
      labels: [],
      subtasks: [],
    });
  }, [addTaskToSection, id]);

  // Keyboard accessibility handler for section header.
  const handleHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    },
    []
  );

  // Toggles the collapse state of the section.
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Filters top-level tasks based on active label and status filters.
  const filteredTopLevelTasks = useMemo(() => {
    return tasks.filter((task) =>
      taskMatchesFilters(task, activeLabelFilters, activeStatusFilter)
    );
  }, [tasks, activeLabelFilters, activeStatusFilter]);

  return (
    <Card className="overflow-hidden border border-border/40 shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-card hover:bg-secondary/60 transition-colors"
        onClick={toggleCollapse}
        onKeyDown={handleHeaderKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={!isCollapsed}
        aria-controls={`section-tasks-${id}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div>
          {isCollapsed ? (
            <ChevronRight className="text-muted-foreground" />
          ) : (
            <ChevronDown className="text-muted-foreground" />
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-4 bg-background" id={`section-tasks-${id}`}>
          <p className="text-sm text-muted-foreground mb-4 italic">
            {description}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddTask();
            }}
            className="mb-4"
            aria-label="Add Task"
          >
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
          {filteredTopLevelTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTopLevelTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  sectionId={id}
                  taskNumber={`${id === "public-section" ? "1" : "2"}.${
                    index + 1
                  }`}
                  level={0}
                />
              ))}
            </div>
          ) : (
            // Message displayed when no tasks are found or match filters.
            <p className="text-sm text-muted-foreground mt-4">
              {activeLabelFilters.length > 0
                ? "No tasks match the current filters in this section."
                : "No tasks in this section. Click 'Add Task' to create one!"}
            </p>
          )}
        </div>
      )}
    </Card>
  );
});
