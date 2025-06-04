import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner"; // Or from "@/components/ui/sonner"

/**
 * Utility for merging Tailwind and conditional classes.
 * Ensures consistent, conflict-free className usage.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Exports data as a downloadable JSON file with a timestamped filename.
 * @param data - The data to export (should be serializable)
 */
export function exportToJson<T = unknown>(data: T) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // --- MODIFICATION START ---
  const now = new Date();
  const datePart = now.toISOString().split("T")[0]; // YYYY-MM-DD
  // Get time parts: HH-MM-SS
  // Pad single digit minutes/seconds with a leading zero
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timePart = `${hours}-${minutes}-${seconds}`;

  a.download = `task-data-${datePart}_${timePart}.json`; // e.g., task-data-2023-10-27_14-30-55.json
  // --- MODIFICATION END ---

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports data from a JSON file and stores it in localStorage.
 * Reloads the page after import for immediate effect.
 * @param file - The JSON file to import
 * @returns Promise resolving to the imported data
 */
export function importFromJson<T = unknown>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          // REPLACE alert with toast.error
          // throw new Error("File content is empty or unreadable.");
          toast.error("Import Error", { description: "File content is empty or unreadable." });
          reject(new Error("File content is empty or unreadable."));
          return;
        }
        const jsonData = JSON.parse(event.target.result as string) as T;
        // Ensure the jsonData is what we expect at a basic level before saving
        // This check depends on the structure you've decided for export/import.
        // For example, if it MUST have a 'tasks' array:
        if (typeof jsonData === 'object' && jsonData !== null && Array.isArray((jsonData as any).tasks)) {
          localStorage.setItem("taskProgressTracker_v1", JSON.stringify(jsonData));
          // REPLACE alert with toast.success BEFORE reload
          // alert("Data imported successfully! The page will now reload.");
          toast.success("Import Successful", {
            description: "Data has been imported. The page will reload shortly.",
            duration: 3000, // Give user time to see it before reload
          });
          // Delay reload slightly to allow toast to be seen
          setTimeout(() => {
            window.location.reload();
          }, 1500); // Adjust delay as needed
          resolve(jsonData);
        } else {
          const errMessage = "Imported JSON has an invalid structure.";
          toast.error("Import Error", { description: errMessage });
          reject(new Error(errMessage));
        }
      } catch (err: any) {
        console.error("Error processing JSON file:", err);
        // REPLACE alert with toast.error
        // alert(`Error importing data: ${err.message || "Invalid JSON format."}`);
        toast.error("Import Error", {
          description: err.message || "Invalid JSON format. Check console for details.",
        });
        reject(err);
      }
    };
    reader.onerror = (error) => {
      console.error("Failed to read file:", reader.error);
      // REPLACE alert with toast.error
      // alert("Failed to read file. Please try again.");
      toast.error("File Read Error", { description: "Failed to read the selected file." });
      reject(reader.error || new Error("Unknown file read error."));
    };
    reader.readAsText(file);
  });
}
