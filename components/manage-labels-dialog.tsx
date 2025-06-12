"use client";

import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTaskStore } from "@/lib/store";
import type { LabelObject, TaskStore as TaskStoreType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Edit2,
  Check,
  Plus,
  Trash2,
  Tag,
  Search,
  Shuffle,
  Palette,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { VIBRANT_LABEL_COLORS, getRandomLabelColor } from "@/lib/labels";

const RightPaneContent = React.memo<{
  selectedLabelId: string | null;
  mode: "view" | "create" | "edit";
  selectedLabel: LabelObject | undefined;
  switchToCreateMode: () => void;
  handleSubmitForm: (e: React.FormEvent) => void;
  handleCancelForm: () => void;
  currentPreviewName: string;
  currentPreviewEmoji: string;
  currentPreviewColor: string | undefined;
  labelName: string;
  setLabelName: (value: string) => void;
  labelEmoji: string;
  setLabelEmoji: (value: string) => void;
  labelColor: string | undefined;
  setLabelColor: (value: string) => void;
  nameInputRef: React.RefObject<HTMLInputElement>;
  handleRandomColor: () => void;
  handleColorSelect: (color: string) => void;
}>(
  ({
    selectedLabelId,
    mode,
    selectedLabel,
    switchToCreateMode,
    handleSubmitForm,
    handleCancelForm,
    currentPreviewName,
    currentPreviewEmoji,
    currentPreviewColor,
    labelName,
    setLabelName,
    labelEmoji,
    setLabelEmoji,
    labelColor,
    setLabelColor,
    nameInputRef,
    handleRandomColor,
    handleColorSelect,
  }) => {
    if (!selectedLabelId && mode !== "create") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-border/20">
            <Tag className="h-8 w-8 text-primary/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Select a label
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Choose a label from the list on the left to view its details, or
            create a new one to get started.
          </p>
          <Button onClick={switchToCreateMode} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Create New Label
          </Button>
        </div>
      );
    }

    const isEditOrCreateMode = mode === "create" || mode === "edit";
    return (
      <form onSubmit={handleSubmitForm} className="flex-1 flex flex-col h-full">
        <div className="flex-1 space-y-4">
          {/* Live Preview */}
          <div
            className={cn(
              "min-h-[96px] flex items-center justify-center rounded-2xl border-2 transition-all border-border/40 bg-muted/30 duration-300",
              isEditOrCreateMode ? "p-6  border-dashed  relative" : "py-6"
            )}
          >
            {isEditOrCreateMode && (
              <UiLabel className="absolute top-2 left-3 text-sm font-semibold text-muted-foreground">
                Preview
              </UiLabel>
            )}
            <Badge
              variant="outline"
              className="text-base px-3 py-1 font-medium rounded-full border-2 shadow-lg transition-all duration-300"
              style={
                currentPreviewColor
                  ? {
                      backgroundColor: `${currentPreviewColor}20`,
                      borderColor: `${currentPreviewColor}60`,
                      color: currentPreviewColor,
                    }
                  : {}
              }
            >
              {currentPreviewEmoji && (
                <span className="mr-3 text-base">{currentPreviewEmoji}</span>
              )}
              {currentPreviewName}
            </Badge>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg h-12 px-4">
              <UiLabel
                htmlFor="label-name"
                className="text-sm font-semibold text-muted-foreground"
              >
                Label Name
              </UiLabel>
              {isEditOrCreateMode ? (
                <Input
                  id="label-name"
                  ref={nameInputRef}
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="e.g., Priority"
                  required
                  className="h-10 text-base rounded-lg border-2 bg-background/50 backdrop-blur-sm transition-all duration-200 bg-primary/10 border-primary/40  text-right w-[260px]"
                />
              ) : (
                <span className="font-semibold text-md text-foreground">
                  {selectedLabel?.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg h-12 px-3">
                <UiLabel
                  htmlFor="label-emoji"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Emoji
                </UiLabel>
                {isEditOrCreateMode ? (
                  <Input
                    id="label-emoji"
                    value={labelEmoji}
                    onChange={(e) => setLabelEmoji(e.target.value)}
                    placeholder="✨"
                    maxLength={4}
                    className="h-10 w-24 text-xl rounded-lg text-center border-2 bg-background/50 backdrop-blur-sm transition-all duration-200 bg-primary/10 border-primary/40 "
                  />
                ) : (
                  <span className="text-xl">
                    {selectedLabel?.emoji || (
                      <span className="text-sm text-muted-foreground font-normal">
                        None
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg h-12 px-3">
                <div className="flex items-center gap-2">
                  <UiLabel className="text-sm font-semibold text-muted-foreground">
                    Color
                  </UiLabel>
                  {isEditOrCreateMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRandomColor}
                      className="h-6 px-1.5 text-xs rounded-md -mr-2"
                    >
                      <Shuffle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {isEditOrCreateMode ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-auto justify-start font-normal h-10 text-base rounded-lg border-2 bg-background/50 backdrop-blur-sm transition-all duration-200 px-3",
                          "border-border/50 hover:border-primary/60 bg-primary/10 border-primary/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {labelColor ? (
                            <div
                              className="h-5 w-5 rounded-md border-2 border-border/50 shadow-sm"
                              style={{ backgroundColor: labelColor }}
                            />
                          ) : (
                            <Palette className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 bg-popover/95 backdrop-blur-xl rounded-2xl border-2 shadow-2xl">
                      <div className="grid grid-cols-6 gap-2">
                        {VIBRANT_LABEL_COLORS.map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-6 w-6 rounded-lg p-0 border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg",
                              labelColor === color &&
                                "ring-4 ring-primary/50 ring-offset-2 ring-offset-background scale-110 shadow-lg"
                            )}
                            style={{
                              backgroundColor: color,
                              borderColor:
                                labelColor === color ? color : "transparent",
                            }}
                            onClick={() => handleColorSelect(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-2">
                    {labelColor ? (
                      <div
                        className="h-5 w-5 rounded-md border-2 border-border/30 shadow-sm"
                        style={{ backgroundColor: labelColor }}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        None
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        {isEditOrCreateMode && (
          <div className="flex gap-3 pt-6 border-t border-border/20 mt-6">
            <Button
              type="submit"
              size="lg"
              className="flex-1 h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {mode === "edit" ? (
                <>
                  <Check className="mr-2 h-5 w-5" /> Save Changes
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" /> Create Label
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancelForm}
              className="px-8 h-12 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    );
  }
);

const RightPaneHeader = React.memo<{
  mode: "view" | "create" | "edit";
  selectedLabel: LabelObject | undefined;
  switchToEditMode: () => void;
  handleDeleteInitiate: () => void;
}>(({ mode, selectedLabel, switchToEditMode, handleDeleteInitiate }) => {
  let title = "Create New Label";
  if (mode === "edit") title = "Edit Label";
  else if (mode === "view" && selectedLabel) title = "Label Details";
  else if (mode !== "create") title = "Manage Labels";

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20 min-h-[65px]">
      <h3 className="text-xl font-bold">{title}</h3>
      {selectedLabel && (
        <div className="flex items-center gap-2">
          <Button
            onClick={switchToEditMode}
            disabled={mode === "edit"}
            size="sm"
            variant="outline"
            className={cn(
              "flex items-center h-9 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200",
              mode === "edit" && "opacity-50 cursor-not-allowed"
            )}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            onClick={handleDeleteInitiate}
            disabled={mode === "edit"}
            variant="destructive"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
              mode === "edit" && "opacity-50 cursor-not-allowed"
            )}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
});

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

  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");

  const [labelName, setLabelName] = useState("");
  const [labelEmoji, setLabelEmoji] = useState("");
  const [labelColor, setLabelColor] = useState<string | undefined>(
    VIBRANT_LABEL_COLORS[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelObject | null>(null);

  const selectedLabel = customLabels.find((l) => l.id === selectedLabelId);

  const filteredLabels = customLabels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const populateForm = useCallback((label: LabelObject | null) => {
    if (label) {
      setLabelName(label.name);
      setLabelEmoji(label.emoji || "");
      setLabelColor(label.color || VIBRANT_LABEL_COLORS[0]);
    } else {
      setLabelName("");
      setLabelEmoji("");
      setLabelColor(getRandomLabelColor());
    }
  }, []);

  // Effect to handle dialog open/close actions
  useEffect(() => {
    if (!isOpen) {
      setSelectedLabelId(null);
      setMode("view");
      setSearchQuery("");
      populateForm(null);
    }
  }, [isOpen]);

  // Effect to focus name input when switching to create/edit mode
  useEffect(() => {
    if (mode === "create" || mode === "edit") {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [mode]);

  const handleSelectLabel = (labelId: string) => {
    setSelectedLabelId(labelId);
    const currentlySelected = customLabels.find((l) => l.id === labelId);
    populateForm(currentlySelected || null);
    setMode("view");
  };

  const switchToEditMode = () => {
    if (selectedLabel) {
      setMode("edit");
    }
  };

  const switchToCreateMode = () => {
    setSelectedLabelId(null);
    populateForm(null);
    setMode("create");
  };

  const handleCancelForm = () => {
    if (selectedLabelId) {
      const previousSelected = customLabels.find(
        (l) => l.id === selectedLabelId
      );
      populateForm(previousSelected || null);
    }
    setMode("view");
  };

  const handleSubmitForm = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!labelName.trim()) {
        toast.error("Label name cannot be empty.");
        nameInputRef.current?.focus();
        return;
      }
      const submittedLabelData = {
        name: labelName.trim(),
        emoji: labelEmoji.trim() || undefined,
        color: labelColor || undefined,
      };

      if (mode === "edit" && selectedLabelId) {
        updateCustomLabel(selectedLabelId, submittedLabelData);
        setMode("view");
        toast.success("Label updated successfully!");
      } else if (mode === "create") {
        const newLabel = addCustomLabel(submittedLabelData);
        if (newLabel) {
          toast.success("Label created successfully!");
          setSelectedLabelId(newLabel.id);
          populateForm(newLabel);
          setMode("view");
        }
      }
    },
    [
      mode,
      selectedLabelId,
      labelName,
      labelEmoji,
      labelColor,
      addCustomLabel,
      updateCustomLabel,
      populateForm,
    ]
  );

  const handleDeleteInitiate = () => {
    if (selectedLabel) {
      setLabelToDelete(selectedLabel);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (labelToDelete) {
      const deletedId = labelToDelete.id;
      const index = customLabels.findIndex((l) => l.id === deletedId);
      deleteCustomLabelFromStore(deletedId);
      setLabelToDelete(null);
      toast.success("Label deleted successfully!");

      if (selectedLabelId === deletedId) {
        const remainingLabels = customLabels.filter((l) => l.id !== deletedId);
        if (remainingLabels.length > 0) {
          const newIndex = Math.min(index, remainingLabels.length - 1);
          handleSelectLabel(remainingLabels[newIndex].id);
        } else {
          setSelectedLabelId(null);
          setMode("view"); // Go to placeholder
        }
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setLabelColor(color === "" ? undefined : color);
  };

  const handleRandomColor = () => {
    setLabelColor(getRandomLabelColor());
  };

  const currentPreviewName =
    labelName.trim() ||
    (mode === "create" ? "New Label" : selectedLabel?.name || "Label Preview");
  const currentPreviewEmoji = labelEmoji.trim();
  const currentPreviewColor = labelColor;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            setSelectedLabelId(null);
            setMode("view");
            setSearchQuery("");
            setLabelName("");
            setLabelEmoji("");
            setLabelColor(getRandomLabelColor());
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-xl rounded-2xl max-h-[80vh] flex flex-col p-0 border-2 border-border/50 shadow-2xl">
          <DialogHeader className="px-4 py-4 border-b border-border/30 flex-shrink-0 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold bg-clip-text">
                  Manage Labels
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-0">
                  Organize your tasks with colorful, customizable labels
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 grid lg:grid-cols-5 gap-0 overflow-hidden">
            {/* Left Pane: Label List */}
            <div className="lg:col-span-2 flex flex-col border-r border-border/30 bg-gradient-to-b from-muted/10 to-muted/30 overflow-hidden">
              <div className="p-4 border-b border-border/20 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-md font-semibold">Your Labels</h3>
                    <p className="text-sm text-muted-foreground">
                      {customLabels.length} label
                      {customLabels.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    onClick={switchToCreateMode}
                    size="sm"
                    variant={mode === "create" ? "default" : "outline"}
                    className={cn(
                      "rounded-xl h-10 px-4 font-medium shadow-sm transition-all duration-200",
                      mode === "create" &&
                        "ring-2 ring-primary/70 text-primary-foreground shadow-lg"
                    )}
                  >
                    <Plus className="h-4 w-4 mr-2" /> New Label
                  </Button>
                </div>
                {customLabels.length > 0 && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search labels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9 rounded-lg border-border/50 bg-background/50 "
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {filteredLabels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-border/20">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {searchQuery ? "No labels found" : "You have no labels"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery
                        ? "Try a different search term"
                        : "Click 'New Label' to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLabels.map((label) => (
                      <div
                        key={label.id}
                        onClick={() => handleSelectLabel(label.id)}
                        className={cn(
                          "flex items-center p-2 rounded-xl cursor-pointer transition-all duration-200 group border-2",
                          selectedLabelId === label.id
                            ? "bg-primary/10 border-primary/40 shadow-md"
                            : "border-transparent hover:bg-accent/60 hover:border-border/40"
                        )}
                      >
                        <Badge
                          variant="outline"
                          className="pointer-events-none text-sm py-1 px-3 font-medium rounded-full border-2 shadow-sm"
                          style={
                            label.color
                              ? {
                                  backgroundColor: `${label.color}15`,
                                  borderColor: `${label.color}60`,
                                  color: label.color,
                                }
                              : {}
                          }
                        >
                          {label.emoji && (
                            <span className="mr-2 text-sm">{label.emoji}</span>
                          )}
                          {label.name}
                        </Badge>
                        {selectedLabelId === label.id && (
                          <div className="ml-auto">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Content */}
            <div className="lg:col-span-3 flex flex-col px-8 pb-8 pt-4 overflow-y-auto bg-gradient-to-br from-background/50 to-muted/10">
              <RightPaneHeader
                mode={mode}
                selectedLabel={selectedLabel}
                switchToEditMode={switchToEditMode}
                handleDeleteInitiate={handleDeleteInitiate}
              />
              <RightPaneContent
                mode={mode}
                selectedLabel={selectedLabel}
                selectedLabelId={selectedLabelId}
                labelName={labelName}
                labelEmoji={labelEmoji}
                labelColor={labelColor}
                nameInputRef={nameInputRef}
                setLabelName={setLabelName}
                setLabelEmoji={setLabelEmoji}
                setLabelColor={setLabelColor}
                handleSubmitForm={handleSubmitForm}
                handleCancelForm={handleCancelForm}
                handleRandomColor={handleRandomColor}
                handleColorSelect={handleColorSelect}
                switchToCreateMode={switchToCreateMode}
                currentPreviewName={currentPreviewName}
                currentPreviewEmoji={currentPreviewEmoji}
                currentPreviewColor={currentPreviewColor}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {labelToDelete && (
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title={`Delete "${labelToDelete.name}"?`}
          description="This will remove the label from all associated tasks. This action cannot be undone."
          onConfirm={handleConfirmDelete}
          confirmText="Delete Label"
        />
      )}
    </>
  );
}
