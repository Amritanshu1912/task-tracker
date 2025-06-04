// components/empty-state-card.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Using Card components
import { Plus, ClipboardList, FileJson2 } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { useCallback } from "react"; // For handleImport if used directly

export function EmptyStateCard() {
  const openAddRootTaskDialog = useTaskStore(
    (state) => state.openAddRootTaskDialog
  );

  // Duplicating handleImport here for the link, or make it a global utility / store action
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Assuming importFromJson is in utils and handles toasts/reload
          const { importFromJson } = await import("@/lib/utils");
          await importFromJson(file);
        } catch (error) {
          console.error("Import from empty state failed:", error);
          // toast.error("Import Failed", { description: "Could not import the file." });
        }
      }
    };
    input.click();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 md:py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center">
          {/* Center header items */}
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <ClipboardList className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Let's Get Things Done!
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground max-w-md">
            Add your first task to start organizing your work and tracking
            progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            onClick={openAddRootTaskDialog}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Your First Task
          </Button>

          <div className="text-sm text-muted-foreground">
            <p className="text-left mb-2">Tips to get started:</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
              <li>Break down big goals into smaller subtasks.</li>
              <li>Use labels to categorize and filter.</li>
              <li>Track your overall progress visually.</li>
            </ul>
          </div>

          <Button
            variant="link"
            size="sm"
            className="text-primary"
            onClick={handleImport}
          >
            <FileJson2 className="mr-2 h-4 w-4" />
            Have tasks already? Import from JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
