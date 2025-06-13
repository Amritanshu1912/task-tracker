// components/task-edit-dialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label"; // Aliased to avoid conflict
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/store";
import type {
  Task,
  LabelObject,
  TaskStore as TaskStoreType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // For feedback
import { ScrollArea } from "./ui/scroll-area";

interface TaskEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  parentId?: string; // For subtasks
  mode: "edit" | "createSubtask" | "createRootTask"; // createRootTask now means root for active project
  taskNumber?: string; // ADD this prop
}

/**
 * TaskEditDialog - Modal dialog for editing or creating a (sub)task.
 * Optimized for performance and accessibility. Modern, clean UI.
 */
export function TaskEditDialog({
  isOpen,
  onOpenChange,
  task,
  parentId,
  mode,
  taskNumber,
}: TaskEditDialogProps) {
  // Local state for form fields
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const storeAddTask = useTaskStore((state: TaskStoreType) => state.addTask);
  const storeUpdateTask = useTaskStore(
    (state: TaskStoreType) => state.updateTask
  );
  const activeProjectId = useTaskStore(
    (state: TaskStoreType) => state.activeProjectId
  );
  const customLabels = useTaskStore(
    (state: TaskStoreType) => state.customLabels
  );

  const dialogTitleText =
    mode === "edit"
      ? "Edit Task"
      : mode === "createSubtask"
      ? "Create New Subtask"
      : "Create New Task"; // For createRootTask in active project
  const titleInputPlaceholder =
    mode === "edit"
      ? "Task title"
      : mode === "createSubtask"
      ? "Subtask title"
      : "Enter new task title";
  const submitButtonText =
    mode === "edit"
      ? "Save Changes"
      : mode === "createSubtask"
      ? "Create Subtask"
      : "Create Task";

  // Populate form fields when dialog opens or task/mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setNotes(task.notes || "");
        setSelectedLabelIds([...task.labels]);
      } else {
        // For createSubtask or createRootTask
        setTitle(mode === "createSubtask" ? "New Subtask" : "New Task");
        setNotes("");
        setSelectedLabelIds([]);
      }
    }
  }, [isOpen, task, mode]);

  const handleLabelToggle = useCallback((labelId: string) => {
    setSelectedLabelIds((prevIds) =>
      prevIds.includes(labelId)
        ? prevIds.filter((id) => id !== labelId)
        : [...prevIds, labelId]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }

    if (mode === "edit" && task) {
      const updatedTaskData: Partial<Task> = {
        title: title.trim(),
        notes: notes.trim(),
        labels: selectedLabelIds,
      };
      storeUpdateTask(task.id, updatedTaskData); // updateTask is now project-scoped in store
    } else if (mode === "createSubtask") {
      if (!parentId) {
        toast.error("Error: Parent ID missing for subtask.");
        return;
      }
      const newSubtask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        labels: selectedLabelIds,
        subtasks: [],
      };
      storeAddTask(newSubtask, parentId); // addTask is now project-scoped in store
    } else if (mode === "createRootTask") {
      if (!activeProjectId) {
        // --- ADD THIS CHECK ---
        toast.error("No active project.", {
          description: "Cannot create task.",
        });
        onOpenChange(false); // Close dialog if no active project
        return;
      }
      const newRootTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        labels: selectedLabelIds,
        subtasks: [],
      };
      // parentId is undefined for root tasks within the active project
      storeAddTask(newRootTask, undefined); // addTask handles adding to active project
    }
    onOpenChange(false);
  }, [
    title,
    notes,
    selectedLabelIds,
    mode,
    task,
    parentId,
    onOpenChange,
    storeUpdateTask,
    storeAddTask,
    activeProjectId,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] rounded-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {dialogTitleText}
            {taskNumber && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({taskNumber})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <UiLabel htmlFor="dialog-title" className="text-right">
              Title
            </UiLabel>
            <Input
              id="dialog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder={titleInputPlaceholder}
              autoFocus
              required
              maxLength={100}
              aria-label="Task title"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <UiLabel htmlFor="dialog-notes" className="text-right pt-2">
              Notes
            </UiLabel>
            <Textarea
              id="dialog-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Optional notes or description"
              maxLength={500}
              aria-label="Task notes"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <UiLabel className="text-right pt-2">Labels</UiLabel>
            <div className="col-span-3">
              {customLabels.length > 0 ? (
                <ScrollArea className="max-h-32">
                  {/* Add ScrollArea if many labels */}
                  <div className="flex flex-wrap gap-2 p-1">
                    {customLabels.map((label: LabelObject) => {
                      const isSelected = selectedLabelIds.includes(label.id);
                      return (
                        <Badge
                          key={label.id}
                          className={cn(
                            "cursor-pointer transition-all duration-150 px-2.5 py-1 text-xs font-semibold rounded-full border-2", // Use border-2 for a slightly thicker, more visible border
                            "focus-visible-ring", // APPLY our new custom focus style
                            isSelected
                              ? "text-white" // High-contrast text for selected state
                              : "hover:opacity-80", // Simple hover effect for unselected
                            // If no color, fall back to default selected/unselected styles
                            !label.color &&
                              (isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border")
                          )}
                          style={
                            label.color
                              ? {
                                  // SELECTED STATE: Opaque background, solid border
                                  backgroundColor: isSelected
                                    ? `${label.color}80`
                                    : `${label.color}20`,
                                  borderColor: isSelected
                                    ? label.color
                                    : `${label.color}80`,
                                  color: isSelected
                                    ? "#fff"
                                    : `${label.color}95`,
                                }
                              : {}
                          }
                          tabIndex={0}
                          aria-pressed={isSelected}
                          aria-label={`Toggle label ${label.name}`}
                          onClick={() => handleLabelToggle(label.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              handleLabelToggle(label.id);
                          }}
                        >
                          {label.emoji && (
                            <span className="mr-1">{label.emoji}</span>
                          )}
                          {label.name}
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground pt-2">
                  No custom labels defined. Add some in "Manage Labels".
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
