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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels";

interface TaskEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  parentId?: string;
  mode: "edit" | "createSubtask" | "createRootTask";
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
}: TaskEditDialogProps) {
  // Local state for form fields
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Determine dialog title and placeholder based on mode
  const dialogTitleText =
    mode === "edit"
      ? "Edit Task"
      : mode === "createSubtask"
      ? "Create New Subtask"
      : "Create New Task"; // For createRootTask
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
        setSelectedLabels([...task.labels]);
      } else {
        setTitle(mode === "createSubtask" ? "New Subtask" : "New Task");
        setNotes("");
        setSelectedLabels([]);
      }
    }
  }, [isOpen, task, mode]);

  // Toggle label selection
  const handleLabelToggle = useCallback((label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }, []);

  // Handle form submission for both edit and createSubtask modes
  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    const { updateTask, addTask } = useTaskStore.getState();

    if (mode === "edit" && task) {
      const updatedTaskData: Partial<Task> = {
        // Use Partial<Task> for fieldsToUpdate
        title: title.trim(),
        notes: notes.trim(),
        labels: selectedLabels,
      };
      updateTask(task.id, updatedTaskData);
    } else if (mode === "createSubtask") {
      if (!parentId) {
        alert("Error: Parent task ID is missing for creating subtask.");
        return;
      }
      const newSubtask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        labels: selectedLabels,
        subtasks: [],
      };
      addTask(newSubtask, parentId); // Call addTask with parentId
    } else if (mode === "createRootTask") {
      // For creating a root task, parentId will be undefined (or explicitly null from store if desired)
      const newRootTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        labels: selectedLabels,
        subtasks: [],
      };
      addTask(newRootTask, undefined); // Pass undefined or null for parentId to signify root
    }
    onOpenChange(false);
  }, [title, notes, selectedLabels, mode, task, parentId, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] rounded-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {dialogTitleText}
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
            <Label htmlFor="dialog-title" className="text-right">
              Title
            </Label>
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
            <Label htmlFor="dialog-notes" className="text-right pt-2">
              Notes
            </Label>
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
            <Label className="text-right pt-2">Labels</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => {
                const isSelected = selectedLabels.includes(label);
                return (
                  <Badge
                    key={label}
                    className={cn(
                      "cursor-pointer transition-colors duration-150 px-2.5 py-0.5 text-xs font-semibold rounded-full border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary/70 hover:bg-primary/90"
                        : "bg-transparent border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`Toggle label ${label}`}
                    onClick={() => handleLabelToggle(label)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleLabelToggle(label);
                    }}
                  >
                    {LABEL_EMOJIS[label] || "🏷️"} {label}
                  </Badge>
                );
              })}
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
