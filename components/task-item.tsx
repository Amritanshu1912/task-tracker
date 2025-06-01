"use client";

import { useState, useEffect, useCallback, memo } from "react";
import type { Task, StatusFilterState } from "@/lib/types";
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
import { taskMatchesFilters } from "./task-section";

interface TaskItemProps {
  task: Task;
  sectionId: string;
  taskNumber: string;
  parentId?: string;
  level?: number;
}

export const TaskItem = memo(function TaskItem({
  task,
  sectionId,
  taskNumber,
  parentId: directParentIdOfThisTask,
  level = 0,
}: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"edit" | "createSubtask">(
    "edit"
  );

  const areAllNotesCollapsed = useTaskStore(
    (state) => state.areAllNotesCollapsed
  );
  const maxVisibleDepth = useTaskStore((state) => state.maxVisibleDepth);
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasNotes = task.notes && task.notes.trim() !== "";

  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Collapse if no subtasks or if task level exceeds max visible depth
    if (!hasSubtasks) return true;
    if (maxVisibleDepth !== null && level >= maxVisibleDepth) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    // Synchronize collapse state with global max visible depth
    if (hasSubtasks) {
      const shouldBeGloballyCollapsed =
        maxVisibleDepth !== null && level >= maxVisibleDepth;
      if (isCollapsed !== shouldBeGloballyCollapsed) {
        setIsCollapsed(shouldBeGloballyCollapsed);
      }
    }
  }, [level, hasSubtasks, maxVisibleDepth, isCollapsed]);

  const handleToggleChevronCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling
      if (hasSubtasks) {
        setIsCollapsed((prev) => !prev);
      }
    },
    [hasSubtasks]
  );

  const handleToggleComplete = useCallback(
    (checked: boolean) => {
      useTaskStore
        .getState()
        .updateTask(
          sectionId,
          task.id,
          { completed: checked },
          directParentIdOfThisTask
        );
    },
    [sectionId, task.id, directParentIdOfThisTask]
  );

  const handleTitleChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      useTaskStore
        .getState()
        .updateTask(
          sectionId,
          task.id,
          { title: e.target.textContent || task.title },
          directParentIdOfThisTask
        );
      setIsEditingTitle(false);
    },
    [sectionId, task.id, task.title, directParentIdOfThisTask]
  );

  const handleNotesChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newNotes = e.target.innerText || "";
      useTaskStore
        .getState()
        .updateTask(
          sectionId,
          task.id,
          { notes: newNotes },
          directParentIdOfThisTask
        );
      setIsEditingNotes(false);
    },
    [sectionId, task.id, directParentIdOfThisTask]
  );

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to delete this task and all its subtasks?"
      )
    ) {
      useTaskStore
        .getState()
        .deleteTask(sectionId, task.id, directParentIdOfThisTask);
    }
  }, [sectionId, task.id, directParentIdOfThisTask]);

  const handleEditTask = useCallback(() => {
    setDialogMode("edit");
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenAddSubtaskDialog = useCallback(() => {
    setDialogMode("createSubtask");
    setIsEditDialogOpen(true);
  }, []);

  const showSubtasks = hasSubtasks && !isCollapsed;

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
            aria-expanded={!isCollapsed && hasSubtasks}
            aria-label={isCollapsed ? "Expand subtasks" : "Collapse subtasks"}
            tabIndex={hasSubtasks ? 0 : -1}
            onKeyDown={(e) => {
              if (hasSubtasks && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleToggleChevronCollapse(e as any);
              }
            }}
          >
            {hasSubtasks &&
              (isCollapsed ? (
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
                  "text-sm text-muted-foreground mt-2 outline-none rounded px-2 py-1 whitespace-pre-wrap",
                  isEditingNotes ? "bg-muted ring-1 ring-ring" : "italic",
                  task.completed && "line-through opacity-80"
                )}
              >
                {task.notes}
              </div>
            )}

            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
                  <div key={subtask.id} className="mt-3">
                    <TaskItem
                      task={subtask}
                      sectionId={sectionId}
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
          sectionId={sectionId}
          parentId={dialogMode === "edit" ? directParentIdOfThisTask : task.id}
          mode={dialogMode}
        />
      )}
    </>
  );
});
