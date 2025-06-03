"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import type { Task, StatusFilterState } from "@/lib/types";
import { taskMatchesFilters } from "../lib/filters";
import { useTaskStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskEditDialog } from "./task-edit-dialog";
import { cn } from "@/lib/utils";
import { LABEL_EMOJIS } from "@/lib/labels";

interface TaskItemProps {
  task: Task;
  taskNumber: string;
  parentId?: string;
  level?: number;
}

export const TaskItem = memo(function TaskItem({
  task,
  parentId,
  taskNumber,
  parentId: directVisualParentId,
  level = 0,
}: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"edit" | "createSubtask">(
    "edit"
  );

  const storeUpdateTask = useTaskStore((state) => state.updateTask);
  const storeDeleteTask = useTaskStore((state) => state.deleteTask);
  const storeAddTask = useTaskStore((state) => state.addTask);

  const areAllNotesCollapsed = useTaskStore(
    (state) => state.areAllNotesCollapsed
  );
  const maxVisibleDepthFromStore = useTaskStore(
    (state) => state.maxVisibleDepth
  );
  const visibilityActionTrigger = useTaskStore(
    (state) => state.visibilityActionTrigger
  );

  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasNotes = task.notes && task.notes.trim() !== "";

  const [manualCollapseOverride, setManualCollapseOverride] = useState<
    boolean | null
  >(null);

  // Effect to reset manual override when a global action occurs
  useEffect(() => {
    if (hasSubtasks) {
      // Only reset if it can be collapsed/expanded
      setManualCollapseOverride(null);
    }
  }, [visibilityActionTrigger, hasSubtasks]);

  const isEffectivelyCollapsed = useMemo(() => {
    if (!hasSubtasks) return true;

    if (manualCollapseOverride !== null) {
      return manualCollapseOverride;
    }
    // Global setting from store
    if (
      maxVisibleDepthFromStore !== null &&
      level >= maxVisibleDepthFromStore
    ) {
      return true;
    }
    return false; // Default to expanded
  }, [hasSubtasks, manualCollapseOverride, maxVisibleDepthFromStore, level]);

  const handleToggleChevronCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasSubtasks) {
        // When user clicks, set or toggle the manual override
        setManualCollapseOverride((prevOverride) => {
          if (prevOverride !== null) {
            return !prevOverride; // Toggle existing manual state
          }
          // If no manual override, determine current state based on global and toggle that
          const currentlyGloballyOrImplicitlyCollapsed =
            (maxVisibleDepthFromStore !== null &&
              level >= maxVisibleDepthFromStore) ||
            false; // false if maxVisibleDepthFromStore is null
          return !currentlyGloballyOrImplicitlyCollapsed;
        });
      }
    },
    [hasSubtasks, maxVisibleDepthFromStore, level] // Add dependencies
  );

  const handleToggleComplete = useCallback(
    (checked: boolean) => {
      // Call storeUpdateTask without sectionId
      storeUpdateTask(task.id, { completed: checked });
    },
    [storeUpdateTask, task.id]
  );

  const handleTitleChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // Call storeUpdateTask without sectionId
      storeUpdateTask(task.id, { title: e.target.textContent || task.title });
      setIsEditingTitle(false);
    },
    [storeUpdateTask, task.id, task.title]
  );

  const handleNotesChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newNotes = e.target.innerText || "";
      // Call storeUpdateTask without sectionId
      storeUpdateTask(task.id, { notes: newNotes });
      setIsEditingTitle(false);
    },
    [storeUpdateTask, task.id]
  );

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to delete this task and all its subtasks?"
      )
    ) {
      storeDeleteTask(task.id);
    }
  }, [parentId, task.id]);

  const handleEditTask = useCallback(() => {
    setDialogMode("edit");
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenAddSubtaskDialog = useCallback(() => {
    setDialogMode("createSubtask");
    setIsEditDialogOpen(true);
  }, []);

  const showSubtasks = hasSubtasks && !isEffectivelyCollapsed;

  const taskItemClasses = cn(
    "task-item",
    "rounded-md",
    "bg-card",
    "shadow-sm",
    {
      "task-completed": task.completed,
    }
  );

  return (
    <>
      <div className={taskItemClasses}>
        <div className="p-3 flex items-start gap-3">
          <div
            className="w-6 h-6 flex items-center justify-center cursor-pointer mt-1"
            onClick={handleToggleChevronCollapse}
            role="button"
            aria-expanded={!isEffectivelyCollapsed && hasSubtasks}
            aria-label={
              isEffectivelyCollapsed ? "Expand subtasks" : "Collapse subtasks"
            }
            tabIndex={hasSubtasks ? 0 : -1}
            onKeyDown={(e) => {
              if (hasSubtasks && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleToggleChevronCollapse(e as any);
              }
            }}
          >
            {hasSubtasks &&
              (isEffectivelyCollapsed ? (
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              ))}
          </div>

          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-2 text-sm"
            aria-labelledby={`task-title-${task.id}`}
          />

          <div className="min-w-[60px] text-xs bg-muted px-2 py-1 rounded text-center mt-1">
            {taskNumber}
          </div>

          <div className="flex-1">
            <div
              id={`task-title-${task.id}`}
              contentEditable={isEditingTitle}
              suppressContentEditableWarning
              onFocus={() => setIsEditingTitle(true)}
              onBlur={handleTitleChange}
              className={cn(
                "outline-none rounded px-2 py-1 text-sm",
                isEditingTitle && "bg-muted ring-1 ring-ring",
                task.completed && "line-through opacity-95"
              )}
            >
              {task.title}
            </div>

            {hasNotes && !areAllNotesCollapsed && (
              <div
                contentEditable={isEditingNotes}
                suppressContentEditableWarning
                onFocus={() => setIsEditingNotes(true)}
                onBlur={handleNotesChange}
                className={cn(
                  "text-sm text-muted-foreground outline-none rounded px-2 py-1 whitespace-pre-wrap",
                  isEditingNotes ? "bg-muted ring-1 ring-ring" : "italic",
                  task.completed && "line-through opacity-80"
                )}
              >
                {task.notes}
              </div>
            )}

            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.labels.map((label, i) => (
                  <Badge
                    key={`${label}-${i}`}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5"
                  >
                    {LABEL_EMOJIS[label] || "🏷️"} {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="task-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditTask}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenAddSubtaskDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Add Subtask
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
          <div
            className={`pl-10 pr-4 pb-3 ml-6 ${
              level < 1
                ? "border-l-2 border-border" // Styles indentation for top-level subtasks
                : "border-l-2 border-border/50 hover:border-border/70" // Styles indentation for nested subtasks
            }`}
          >
            {task.subtasks.map(
              (subtask, index) =>
                taskMatchesFilters(
                  subtask,
                  activeLabelFilters,
                  activeStatusFilter
                ) && (
                  <div key={subtask.id} className="mt-1">
                    <TaskItem
                      task={subtask}
                      taskNumber={`${taskNumber}.${index + 1}`}
                      parentId={task.id}
                      level={level + 1}
                    />
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {isEditDialogOpen && (
        <TaskEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={dialogMode === "edit" ? task : null}
          parentId={
            dialogMode === "createSubtask" ? task.id : directVisualParentId
          }
          mode={dialogMode}
        />
      )}
    </>
  );
});
