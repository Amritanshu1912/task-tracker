// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { useTaskStore, LOCAL_STORAGE_KEY } from "@/lib/store";

/**
 * Combines Tailwind class names, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Downloads given data as a timestamped JSON file.
 */
export function exportToJson<T = unknown>(data: T) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const now = new Date();

  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join("-");

  a.href = url;
  a.download = `task-data-${date}_${time}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and validates JSON data from a file.
 * Stores it in localStorage and reloads the app.
 */
export function importFromJson<T = unknown>(file: File): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const storeActions = useTaskStore.getState();
    storeActions.pauseAutoSave();

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          toast.error("Import Error", { description: "File content is empty." });
          storeActions.resumeAutoSave();
          reject(new Error("File content is empty."));
          return;
        }
        const jsonData = JSON.parse(event.target.result as string) as any; // Use 'any' for initial parse

        // Validate the structure expected by dangerouslyOverwriteState
        if (jsonData && Array.isArray(jsonData.tasks)) {
          // Instead of writing to localStorage here and reloading,
          // directly update the store state.
          storeActions.dangerouslyOverwriteState(jsonData);

          toast.success("Import Successful", {
            description: "Data has been imported and applied.",
            duration: 3000,
          });
          // NO window.location.reload();
          storeActions.resumeAutoSave(true); // Resume and trigger a save of the newly imported state
          resolve(jsonData as T);
        } else {
          const errMessage = "Imported JSON data has an invalid structure (missing 'tasks' array or not an object).";
          toast.error("Import Error", { description: errMessage });
          storeActions.resumeAutoSave();
          reject(new Error(errMessage));
        }
      } catch (err: any) {
        console.error("Error processing JSON file for import:", err);
        toast.error("Import Error", {
          description: err.message || "Invalid JSON format. Check console.",
        });
        storeActions.resumeAutoSave();
        reject(err);
      }
    };
    reader.onerror = (error) => {
      console.error("Failed to read file for import:", reader.error);
      toast.error("File Read Error", { description: "Failed to read selected file." });
      storeActions.resumeAutoSave();
      reject(reader.error || new Error("Unknown file read error."));
    };
    reader.readAsText(file);
  });
}