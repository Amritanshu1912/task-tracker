// components/empty-state-card.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, ClipboardList, FileJson2 } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { useCallback } from "react";
import { toast } from "sonner"; // For feedback if import is used here

export function EmptyStateCard() {
  // --- MODIFY HERE: Use openAddTaskDialog ---
  const openAddTaskDialog = useTaskStore((state) => state.openAddTaskDialog);
  const activeProjectId = useTaskStore((state) => state.activeProjectId);

  const handleImportForActiveProject = useCallback(async () => {
    if (!activeProjectId) {
      toast.error("No active project", {
        description:
          "Please select or create a project before importing tasks into it.",
      });
      return;
    }
    // The global importFromJson in utils.ts is now designed to add an imported file as a *new project*.
    // For importing tasks *into the current empty project*, we'd need a different utility or logic.
    // For now, this button might be misleading if it imports as a new project.
    // Option 1: Disable/hide this button on EmptyStateCard.
    // Option 2: Keep it, but clarify it imports as a new project.
    // Option 3: Refactor import to allow merging into active project (more complex).
    // Let's go with Option 2 for now and rely on the global import button in sidebar.
    // Or, simply remove this button from here to avoid confusion, as "Import Project" is in sidebar.
    // I'll comment out the import button from here to simplify.
    toast.info(
      "To import a project, please use the 'Import Project' option in the sidebar's Data Management section."
    );

    // const input = document.createElement("input");
    // input.type = "file";
    // input.accept = ".json";
    // input.onchange = async (e) => {
    //   const file = (e.target as HTMLInputElement).files?.[0];
    //   if (file) {
    //     try {
    //       const { importFromJson } = await import("@/lib/utils"); // This imports as new project
    //       await importFromJson(file);
    //     } catch (error) {
    //       console.error("Import from empty state failed:", error);
    //     }
    //   }
    // };
    // input.click();
  }, [activeProjectId]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 md:py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <ClipboardList className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Let's Get This Project Rolling!
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground max-w-md">
            Your project is empty. Add your first task to start organizing your
            work.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            // --- MODIFY HERE: Call openAddTaskDialog ---
            onClick={() => openAddTaskDialog()}
            className="w-full sm:w-auto"
            disabled={!activeProjectId} // Disable if somehow no active project (though this card implies one)
          >
            <Plus className="mr-2 h-5 w-5" />
            Add First Task to Project
          </Button>

          <div className="text-sm text-muted-foreground">
            <p className="text-left mb-2">Tips to get started:</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
              <li>Break down big goals into smaller subtasks.</li>
              <li>Use labels to categorize and filter.</li>
              <li>Track your overall progress visually.</li>
            </ul>
          </div>

          {/* Removed import button from here to avoid confusion with sidebar's "Import Project" */}
          {/* <Button
            variant="link"
            size="sm"
            className="text-primary"
            onClick={handleImportForActiveProject} // This would import as a NEW project
          >
            <FileJson2 className="mr-2 h-4 w-4" />
            Import tasks into this project (Not Recommended - Imports as New Project)
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
