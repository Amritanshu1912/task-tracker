// components/task-item.tsx
"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import type {
  Task,
  LabelObject,
  TaskStore as TaskStoreType,
} from "@/lib/types";
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
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, // Import DropdownMenuItem
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem, // Import ContextMenuItem
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TaskEditDialog } from "./task-edit-dialog";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

// --- REFACTORED: The shared component now accepts the Item component as a prop ---
const TaskActionsMenuContent = ({
  ItemComponent,
  onEdit,
  onAddSubtask,
  onDelete,
}: {
  ItemComponent: typeof DropdownMenuItem | typeof ContextMenuItem; // The component to render
  onEdit: () => void;
  onAddSubtask: () => void;
  onDelete: () => void;
}) => {
  const Item = ItemComponent; // Assign to a capitalized variable for JSX
  return (
    <>
      <Item onClick={onEdit}>
        <Edit2 className="mr-2 h-4 w-4" /> Edit Task
      </Item>
      <Item onClick={onAddSubtask}>
        <Plus className="mr-2 h-4 w-4" /> Add Subtask
      </Item>
      <Item
        onClick={onDelete}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete Task
      </Item>
    </>
  );
};

interface TaskItemProps {
  task: Task;
  taskNumber: string;
  parentId?: string;
  level?: number;
}

export const TaskItem = memo(function TaskItem({
  task,
  parentId: parentIdForSubtaskDialog,
  taskNumber,
  level = 0,
}: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"edit" | "createSubtask">(
    "edit"
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const storeUpdateTask = useTaskStore(
    (state: TaskStoreType) => state.updateTask
  );
  const storeDeleteTask = useTaskStore(
    (state: TaskStoreType) => state.deleteTask
  );
  const areAllNotesCollapsed = useTaskStore(
    (state: TaskStoreType) => state.areAllNotesCollapsed
  );
  const maxVisibleDepthFromStore = useTaskStore(
    (state: TaskStoreType) => state.maxVisibleDepth
  );
  const visibilityActionTrigger = useTaskStore(
    (state: TaskStoreType) => state.visibilityActionTrigger
  );
  const activeLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.activeLabelFilters
  );
  const activeStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.activeStatusFilter
  );
  const customLabels = useTaskStore(
    (state: TaskStoreType) => state.customLabels
  );

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasNotes = task.notes && task.notes.trim() !== "";

  const [manualCollapseOverride, setManualCollapseOverride] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (hasSubtasks) {
      setManualCollapseOverride(null);
    }
  }, [visibilityActionTrigger, hasSubtasks]);

  const isEffectivelyCollapsed = useMemo(() => {
    if (!hasSubtasks) return true;
    if (manualCollapseOverride !== null) {
      return manualCollapseOverride;
    }
    if (
      maxVisibleDepthFromStore !== null &&
      level >= maxVisibleDepthFromStore
    ) {
      return true;
    }
    return false;
  }, [hasSubtasks, manualCollapseOverride, maxVisibleDepthFromStore, level]);

  const handleToggleChevronCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasSubtasks) {
        setManualCollapseOverride((prevOverride) => {
          if (prevOverride !== null) {
            return !prevOverride;
          }
          const currentlyGloballyOrImplicitlyCollapsed =
            (maxVisibleDepthFromStore !== null &&
              level >= maxVisibleDepthFromStore) ||
            false;
          return !currentlyGloballyOrImplicitlyCollapsed;
        });
      }
    },
    [hasSubtasks, maxVisibleDepthFromStore, level]
  );

  const handleToggleComplete = useCallback(
    (checked: boolean) => {
      storeUpdateTask(task.id, { completed: checked });
    },
    [storeUpdateTask, task.id]
  );

  const handleTitleChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      storeUpdateTask(task.id, { title: e.target.textContent || task.title });
      setIsEditingTitle(false);
    },
    [storeUpdateTask, task.id, task.title]
  );

  const handleNotesChange = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const newNotes = e.target.innerText || "";
      storeUpdateTask(task.id, { notes: newNotes });
      setIsEditingTitle(false);
    },
    [storeUpdateTask, task.id]
  );

  const handleDeleteInitiate = useCallback(() => {
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    storeDeleteTask(task.id);
  }, [storeDeleteTask, task.id]);

  const handleEditTask = useCallback(() => {
    setDialogMode("edit");
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenAddSubtaskDialog = useCallback(() => {
    setDialogMode("createSubtask");
    setIsEditDialogOpen(true);
  }, []);

  const resolvedLabels = useMemo(() => {
    if (!task.labels || task.labels.length === 0) return [];
    return task.labels
      .map((labelId) => customLabels.find((cl) => cl.id === labelId))
      .filter(Boolean) as LabelObject[];
  }, [task.labels, customLabels]);

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
      <ContextMenu>
        <ContextMenuTrigger>
          <div className={taskItemClasses}>
            <div className="p-3 flex items-start gap-3">
              <div
                className="w-6 h-6 flex items-center justify-center cursor-pointer mt-1 shrink-0"
                onClick={handleToggleChevronCollapse}
                role="button"
                aria-expanded={showSubtasks}
                aria-label={
                  isEffectivelyCollapsed
                    ? "Expand subtasks"
                    : "Collapse subtasks"
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
                className="mt-1.5 shrink-0"
                aria-labelledby={`task-title-${task.id}`}
              />

              <div className="min-w-[60px] sm:min-w-[50px] text-xs bg-muted px-2 py-1 rounded text-center mt-1">
                {taskNumber}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  id={`task-title-${task.id}`}
                  contentEditable={isEditingTitle}
                  suppressContentEditableWarning
                  onFocus={() => setIsEditingTitle(true)}
                  onBlur={handleTitleChange}
                  className={cn(
                    "outline-none rounded px-2 py-1 text-sm",
                    isEditingTitle && "bg-muted ring-1 ring-ring",
                    task.completed &&
                      "line-through text-muted-foreground opacity-80"
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
                      task.completed && "line-through opacity-70"
                    )}
                  >
                    {task.notes}
                  </div>
                )}
                {resolvedLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resolvedLabels.map((labelObj) => (
                      <Badge
                        key={labelObj.id}
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 font-normal"
                        style={
                          labelObj.color
                            ? {
                                backgroundColor: `${labelObj.color}20`,
                                borderColor: `${labelObj.color}80`,
                                color: labelObj.color,
                              }
                            : {}
                        }
                      >
                        {labelObj.emoji && (
                          <span className="mr-1">{labelObj.emoji}</span>
                        )}
                        {labelObj.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="task-actions shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* --- FIXED: Pass the correct ItemComponent --- */}
                    <TaskActionsMenuContent
                      ItemComponent={DropdownMenuItem}
                      onEdit={handleEditTask}
                      onAddSubtask={handleOpenAddSubtaskDialog}
                      onDelete={handleDeleteInitiate}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
              <div
                className={cn(
                  "pl-10 pr-3 pb-3 ml-5",
                  level < 1
                    ? "border-l-2 border-border"
                    : "border-l-2 border-border/50 hover:border-border/70"
                )}
              >
                {task.subtasks.map(
                  (subtask, index) =>
                    taskMatchesFilters(
                      subtask,
                      activeLabelFilters,
                      activeStatusFilter
                    ) && (
                      <div key={subtask.id} className="mt-2 first:mt-0">
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
        </ContextMenuTrigger>
        <ContextMenuContent>
          {/* --- FIXED: Pass the correct ItemComponent --- */}
          <TaskActionsMenuContent
            ItemComponent={ContextMenuItem}
            onEdit={handleEditTask}
            onAddSubtask={handleOpenAddSubtaskDialog}
            onDelete={handleDeleteInitiate}
          />
        </ContextMenuContent>
      </ContextMenu>

      {isEditDialogOpen && (
        <TaskEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={dialogMode === "edit" ? task : null}
          parentId={dialogMode === "createSubtask" ? task.id : undefined}
          mode={dialogMode}
          taskNumber={
            dialogMode === "edit"
              ? taskNumber
              : `${taskNumber}.${task.subtasks.length + 1}`
          }
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={`Delete Task: "${task.title}"?`}
        description="This will permanently delete this task and all its subtasks. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete Task"
      />
    </>
  );
});
