import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  a.download = `task-tracker-progress-${new Date().toISOString().split("T")[0]}.json`;
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
        const jsonData = JSON.parse(event.target?.result as string) as T;
        localStorage.setItem("taskTrackerProgress_v3", JSON.stringify(jsonData));
        // Consider replacing reload with a state update for better UX in the future
        window.location.reload();
        resolve(jsonData);
      } catch (err) {
        // In production, replace alert with a toast/snackbar for better UX
        alert("Error parsing JSON file");
        reject(err);
      }
    };
    reader.onerror = () => {
      alert("Failed to read file. Please try again.");
      reject(reader.error);
    };
    reader.readAsText(file);
  });
}
