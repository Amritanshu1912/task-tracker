// lib/filters.ts

import type { Task, StatusFilterState, LabelObject } from "./types";

export const taskMatchesFilters = (
  task: Task,
  activeLabelFilterIds: string[], // Renamed for clarity: these are now IDs
  activeStatus: StatusFilterState | null
): boolean => {
  let result = false;

  const taskMatchesLabels =
    activeLabelFilterIds.length === 0 ||
    task.labels.some((taskLabelId) =>
      activeLabelFilterIds.includes(taskLabelId)
    );

  if (activeStatus === 'active') {
    if (task.completed) {
      result = false;
    } else { // Task is not completed (is active)
      if (taskMatchesLabels) {
        result = true;
      } else if (task.subtasks && task.subtasks.length > 0) {
        result = task.subtasks.some(st => taskMatchesFilters(st, activeLabelFilterIds, 'active'));
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
        result = task.subtasks.some(st => taskMatchesFilters(st, activeLabelFilterIds, 'completed'));
      } else {
        result = false;
      }
    }
  } else { // No status filter (activeStatus === null)
    if (taskMatchesLabels) {
      result = true;
    } else if (task.subtasks && task.subtasks.length > 0) {
      result = task.subtasks.some(st => taskMatchesFilters(st, activeLabelFilterIds, null));
    } else {
      result = false;
    }
  }
  return result;
};
// --- END OF FILE lib/filters.ts ---

