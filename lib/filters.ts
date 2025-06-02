// --- START OF FILE lib/filters.ts ---
import type { Task, StatusFilterState } from "./types"; // Adjust path if needed

export const taskMatchesFilters = (
  task: Task,
  activeLabels: string[],
  activeStatus: StatusFilterState | null
): boolean => {
  let result = false;

  const taskMatchesLabels =
    activeLabels.length === 0 ||
    task.labels.some((label) => activeLabels.includes(label));

  if (activeStatus === 'active') {
    if (task.completed) {
      result = false;
    } else { // Task is not completed (is active)
      if (taskMatchesLabels) {
        result = true;
      } else if (task.subtasks && task.subtasks.length > 0) {
        result = task.subtasks.some(st => taskMatchesFilters(st, activeLabels, 'active'));
      } else {
        result = false;
      }
    }
  } else if (activeStatus === 'completed') {
    let isExactlyThisTaskAMatch = task.completed && taskMatchesLabels;

    if (isExactlyThisTaskAMatch) {
      result = true;
    } else {
      if (task.subtasks && task.subtasks.length > 0) {
        result = task.subtasks.some(st => taskMatchesFilters(st, activeLabels, 'completed'));
      } else {
        result = false;
      }
    }
  } else { // No status filter (activeStatus === null)
    if (taskMatchesLabels) {
      result = true;
    } else if (task.subtasks && task.subtasks.length > 0) {
      result = task.subtasks.some(st => taskMatchesFilters(st, activeLabels, null));
    } else {
      result = false;
    }
  }
  return result;
};
// --- END OF FILE lib/filters.ts ---

