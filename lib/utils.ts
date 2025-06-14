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

// NEW: Helper function to create the standardized project filename
function createProjectExportFilename(projectName: string): string {
  const now = new Date();

  // Format date as DD-MM-YYYY
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = now.getFullYear();
  const date = `${day}-${month}-${year}`;

  // Format time as HH-mm-ss
  const time = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');

  // Sanitize project name (replace spaces with hyphens and remove invalid characters)
  const sanitizedName = projectName
    .replace(/\s+/g, '-')
    .replace(/[\/\\?%*:|"<>]/g, '');

  return `${sanitizedName}-Data-${date}_${time}.json`;
}

/**
 * Downloads given data as a timestamped JSON file.
 */
export function exportToJson(
  data: { projectName: string; tasks: unknown[] }, // Expect data to include projectName
) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  // Generate the filename using our new centralized helper function
  a.download = createProjectExportFilename(data.projectName);

  a.href = url;
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
        const jsonData = JSON.parse(event.target.result as string) as any;

        // Validate the structure expected by dangerouslyOverwriteState
        if (jsonData && Array.isArray(jsonData.tasks)) {

          const newProjectId = storeActions.dangerouslyOverwriteState(jsonData);
          // If the import was successful and we have a new ID, switch to it
          if (newProjectId) {
            storeActions.setActiveProject(newProjectId);
            toast.success("Import Successful", {
              description: `Project "${jsonData.projectName || 'Untitled'}" imported and is now active.`,
              duration: 3000,
            });
          } else {
            // This case handles if dangerouslyOverwriteState failed internally
            toast.error("Import Failed", { description: "Could not add the project to your workspace." });
          }

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