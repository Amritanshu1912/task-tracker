// components/manage-labels-dialog.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "@/lib/store";
import type { LabelObject, TaskStore as TaskStoreType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label"; // Alias to avoid conflict with HTML label
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Edit2, Palette, SmilePlus, Check, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"; // Assuming path
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // For color picker
import { cn } from "@/lib/utils";

// Simple predefined color palette
const PREDEFINED_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FED766",
  "#2AB7CA",
  "#F0B7A4",
  "#F9ADA0",
  "#F9D423",
  "#7BC8A4",
  "#A2DED0",
  "#8A8295",
  "#B392AC",
];

export function ManageLabelsDialog() {
  const isOpen = useTaskStore(
    (state: TaskStoreType) => state.isManageLabelsDialogOpen
  );
  const closeDialog = useTaskStore(
    (state: TaskStoreType) => state.closeManageLabelsDialog
  );
  const customLabels = useTaskStore(
    (state: TaskStoreType) => state.customLabels
  );
  const addCustomLabel = useTaskStore(
    (state: TaskStoreType) => state.addCustomLabel
  );
  const updateCustomLabel = useTaskStore(
    (state: TaskStoreType) => state.updateCustomLabel
  );
  const deleteCustomLabelFromStore = useTaskStore(
    (state: TaskStoreType) => state.deleteCustomLabel
  );
  const [isEditing, setIsEditing] = useState<string | null>(null); // Stores ID of label being edited, or null for 'add' mode
  const [labelName, setLabelName] = useState("");
  const [labelEmoji, setLabelEmoji] = useState("");
  const [labelColor, setLabelColor] = useState<string | undefined>(undefined); // Store as undefined or hex string

  const [showAddForm, setShowAddForm] = useState(false);

  // For delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelObject | null>(null);

  const resetForm = useCallback(() => {
    setIsEditing(null);
    setLabelName("");
    setLabelEmoji("");
    setLabelColor(PREDEFINED_COLORS[0]); // Default to first color or undefined
    setShowAddForm(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm(); // Reset form when dialog opens
    }
  }, [isOpen, resetForm]);

  const handleEdit = useCallback((label: LabelObject) => {
    setIsEditing(label.id);
    setLabelName(label.name);
    setLabelEmoji(label.emoji || "");
    setLabelColor(label.color || PREDEFINED_COLORS[0]);
    setShowAddForm(true); // Show form for editing
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!labelName.trim()) {
        toast.error("Label name cannot be empty.");
        return;
      }
      const labelData = {
        name: labelName.trim(),
        emoji: labelEmoji.trim() || undefined, // Store as undefined if empty
        color: labelColor || undefined, // Store as undefined if no color
      };

      if (isEditing) {
        updateCustomLabel(isEditing, labelData);
      } else {
        addCustomLabel(labelData);
      }
      resetForm();
    },
    [
      isEditing,
      labelName,
      labelEmoji,
      labelColor,
      addCustomLabel,
      updateCustomLabel,
      resetForm,
    ]
  );

  const handleDeleteInitiate = (label: LabelObject) => {
    setLabelToDelete(label);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (labelToDelete) {
      deleteCustomLabelFromStore(labelToDelete.id);
      setLabelToDelete(null);
    }
  };

  const handleColorSelect = (color: string) => {
    setLabelColor(color);
    // Optionally close popover here if it's a Popover component
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-card rounded-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Labels</DialogTitle>
            <DialogDescription>
              Create, edit, or delete custom labels for your tasks. Labels help
              you categorize and filter.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-hidden grid grid-cols-1 md:grid-cols-3 gap-6 pr-2">
            {/* Add/Edit Form Section */}
            <div className="md:col-span-1 space-y-4 py-2 md:border-r md:pr-6">
              <h3 className="text-lg font-semibold">
                {isEditing ? "Edit Label" : "Add New Label"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <UiLabel htmlFor="label-name" className="text-xs font-medium">
                    Name (Required)
                  </UiLabel>
                  <Input
                    id="label-name"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    placeholder="e.g., Urgent, Frontend"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <UiLabel
                      htmlFor="label-emoji"
                      className="text-xs font-medium"
                    >
                      Emoji (Optional)
                    </UiLabel>
                    <Input
                      id="label-emoji"
                      value={labelEmoji}
                      onChange={(e) => setLabelEmoji(e.target.value)}
                      placeholder="e.g., ✨"
                      maxLength={2} // Most emojis are 1 or 2 chars
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <UiLabel
                      htmlFor="label-color"
                      className="text-xs font-medium"
                    >
                      Color
                    </UiLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-1 justify-start font-normal"
                        >
                          <div className="flex items-center gap-2">
                            {labelColor ? (
                              <div
                                className="h-4 w-4 rounded-sm border"
                                style={{ backgroundColor: labelColor }}
                              />
                            ) : (
                              <Palette className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>
                              {labelColor
                                ? labelColor.toUpperCase()
                                : "Select color"}
                            </span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                          {PREDEFINED_COLORS.map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              size="icon"
                              className={cn(
                                "h-7 w-7 rounded-sm p-0 border",
                                labelColor === color &&
                                  "ring-2 ring-ring ring-offset-2"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorSelect(color)}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-7 w-7 rounded-sm p-0 border flex items-center justify-center",
                              !labelColor && "ring-2 ring-ring ring-offset-2"
                            )}
                            onClick={() => handleColorSelect("")} // Empty string for no color
                            aria-label="No color"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1">
                    {isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Label
                      </>
                    )}
                  </Button>
                  {(isEditing ||
                    showAddForm ||
                    labelName ||
                    labelEmoji ||
                    labelColor) && ( // Show cancel if form is dirty or editing
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* List of Custom Labels Section */}
            <div className="md:col-span-2 py-2 flex flex-col overflow-y-hidden">
              <h3 className="text-lg font-semibold mb-1">Your Custom Labels</h3>
              {customLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground flex-1 flex items-center justify-center">
                  No custom labels yet. Add one!
                </p>
              ) : (
                <ScrollArea className="flex-1 -mr-2 pr-1">
                  {" "}
                  {/* Negative margin for scrollbar */}
                  <div className="space-y-2">
                    {customLabels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-2.5 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {label.color && (
                            <span
                              className="h-3 w-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: label.color }}
                              title={`Color: ${label.color}`}
                            />
                          )}
                          {label.emoji && (
                            <span className="text-sm">{label.emoji}</span>
                          )}
                          <span
                            className="text-sm font-medium text-foreground truncate"
                            title={label.name}
                          >
                            {label.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(label)}
                            title="Edit label"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteInitiate(label)}
                            title="Delete label"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {labelToDelete && (
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title={`Delete Label: "${labelToDelete.name}"?`}
          description="This will remove the label from all associated tasks. This action cannot be undone."
          onConfirm={handleConfirmDelete}
          confirmText="Delete Label"
        />
      )}
    </>
  );
}
