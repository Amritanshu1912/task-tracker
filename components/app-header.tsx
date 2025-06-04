// components/app-header.tsx

"use client";

import { useCallback } from "react";
import { useTaskStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Zap, Save, FileDown, FileUp } from "lucide-react";
import { exportToJson, importFromJson } from "@/lib/utils";
import { toast } from "sonner";

// Renders the application header with branding and data management buttons.
export function AppHeader() {
  const saveToLocalStorage = useTaskStore((state) => state.saveToLocalStorage);

  const handleSave = useCallback(() => {
    saveToLocalStorage();
    toast.success("Progress Saved", {
      description: "Your changes have been saved to local storage.",
    });
  }, [saveToLocalStorage]);

  const handleExport = useCallback(() => {
    // Construct the object to be exported, matching saveToLocalStorage structure
    const stateToExport = {
      tasks: useTaskStore.getState().tasks,
      activeLabelFilters: useTaskStore.getState().activeLabelFilters,
      activeStatusFilter: useTaskStore.getState().activeStatusFilter,
      isSidebarOpen: useTaskStore.getState().isSidebarOpen,
      maxVisibleDepth: useTaskStore.getState().maxVisibleDepth,
      areAllNotesCollapsed: useTaskStore.getState().areAllNotesCollapsed,
      // Add any other state you want to include in the export, like visibilityActionTrigger if needed
    };
    exportToJson(stateToExport);
    toast.info("Data Exported", {
      description: "Your task data has been downloaded as a JSON file.",
    });
  }, []);

  // Prompts user to select a JSON file and imports it into the store.
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      // Make async to await importFromJson if it returns a promise
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromJson(file);
        } catch (error) {
          toast.error("Import Failed", {
            description:
              error instanceof Error
                ? error.message
                : "Could not import the file.",
          });
          console.error("Import initiation failed or was rejected:", error);
        }
      }
    };
    input.click();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Task Tracker</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                E-commerce Platform - Phase 2
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            title="Save Progress"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export JSON"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            title="Import JSON"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
        </div>
      </div>
    </header>
  );
}
